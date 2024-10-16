/* eslint-disable prettier/prettier */
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Banner, Type, TypeSettings } from './entities/type.entity';
import Fuse from 'fuse.js';
import { GetTypesDto } from './dto/get-types.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { convertToSlug } from 'src/helpers';
import { Attachment } from 'src/common/entities/attachment.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { In, Repository } from 'typeorm';
import { Tag } from 'src/tags/entities/tag.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Region } from '../region/entities/region.entity';

@Injectable()
export class TypesService {
  constructor(
    private readonly uploadsService: UploadsService,

    @InjectRepository(Type) private readonly typeRepository: Repository<Type>,
    @InjectRepository(TypeSettings) private readonly typeSettingsRepository: Repository<TypeSettings>,
    @InjectRepository(Banner) private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Attachment) private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Region) private readonly regionRepository: Repository<Region>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

  ) { }

  async convertToSlug(text) {
    return await convertToSlug(text);
  }

  async findAll(query: GetTypesDto) {
    const { text, search, shop_id, shopSlug, region_name } = query;

    // // Generate a unique cache key based on query parameters
    // const cacheKey = `types_${shop_id || 'none'}_${shopSlug || 'none'}_${text || 'none'}_${search || 'none'}_${region_name || 'none'}`;

    // // Check if the data is cached
    // const cachedData = await this.cacheManager.get<Type[]>(cacheKey);
    // if (cachedData) {
    //   return cachedData;
    // }

    // Initialize the query builder
    const queryBuilder = this.typeRepository.createQueryBuilder('type')
      .leftJoinAndSelect('type.settings', 'settings')
      .leftJoinAndSelect('type.promotional_sliders', 'promotional_sliders')
      .leftJoinAndSelect('type.banners', 'banners')
      .leftJoinAndSelect('banners.image', 'banner_image')
      .leftJoinAndSelect('type.regions', 'regions');

    // Add conditions based on shop_id or shopSlug
    if (shop_id) {
      queryBuilder.andWhere('type.shopId = :shopId', { shopId: shop_id });
    } else if (shopSlug) {
      const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } })
      queryBuilder.andWhere('type.shopId = :shopId', { shopId: shop.id });
    }

    // Filter by region name if provided
    if (region_name) {
      queryBuilder.andWhere('regions.name = :regionName', { regionName: region_name });
    }

    // Execute the query
    let data: Type[] = await queryBuilder.getMany();

    // Use Fuse.js for searching
    const fuse = new Fuse(data, { keys: ['name', 'slug'] });

    // Apply text search if provided
    if (text && text.replace(/%/g, '').length) {
      data = fuse.search(text).map(({ item }) => item);
    }

    // Handle search parameters
    if (search) {
      const parseSearchParams = search.split(';');
      const searchConditions: any[] = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key !== 'slug') {
          searchConditions.push({ [key]: value });
        }
      }
      data = fuse.search({ $and: searchConditions }).map(({ item }) => item);
    }

    // // Cache the result
    // await this.cacheManager.set(cacheKey, data, 3600); // Cache for 1 hour

    return data;
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    // Generate a unique cache key based on the slug
    const cacheKey = `type_${slug}`;

    // Check if the data is cached
    const cachedType = await this.cacheManager.get<Type>(cacheKey);
    if (cachedType) {
      return cachedType;
    }

    // Fetch data from the database using QueryBuilder
    const type = await this.typeRepository.createQueryBuilder('type')
      .leftJoinAndSelect('type.settings', 'settings')
      .leftJoinAndSelect('type.promotional_sliders', 'promotional_sliders')
      .leftJoinAndSelect('type.banners', 'banners')
      .leftJoinAndSelect('banners.image', 'banner_image')
      .leftJoinAndSelect('type.products', 'products')
      .where('type.slug = :slug', { slug })
      .getOne();

    if (!type) {
      throw new NotFoundException(`Type with slug ${slug} not found`);
    }

    // Cache the result
    await this.cacheManager.set(cacheKey, type, 300); // Cache for 5 minutes

    return type;
  }


  async create(data: CreateTypeDto) {
    // Create and save TypeSettings
    const typeSettings = this.typeSettingsRepository.create(data.settings);
    await this.typeSettingsRepository.save(typeSettings);

    // Fetch promotional sliders
    let promotionalSliders = [];
    if (data.promotional_sliders && Array.isArray(data.promotional_sliders)) {
      promotionalSliders = await this.attachmentRepository.findByIds(data.promotional_sliders.map(slider => slider.id));
    }

    // Create and save banners with associated images
    let banners = [];
    if (data.banners && Array.isArray(data.banners)) {
      banners = await Promise.all(data.banners.map(async (bannerData) => {
        const image = await this.attachmentRepository.findOne({
          where: { id: bannerData.image.id, thumbnail: bannerData.image.thumbnail, original: bannerData.image.original }
        });

        const banner = this.bannerRepository.create({
          title: bannerData.title,
          description: bannerData.description,
          image,
        });

        return this.bannerRepository.save(banner);
      }));
    }

    // Convert name to slug
    if (data.name) {
      data.slug = await this.convertToSlug(data.name);
    }

    // Fetch the shop by ID
    const shop = await this.shopRepository.findOne({ where: { id: data.shop_id } });
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${data.shop_id} not found`);
    }

    // Fetch the regions by names
    const regions = await this.regionRepository.find({
      where: {
        name: In(data.region_name),
      },
    });

    // Check if all requested regions were found
    if (regions.length !== data.region_name.length) {
      const missingRegionNames = data.region_name.filter(
        (name) => !regions.some((region) => region.name === name)
      );
      throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
    }

    // Create and save Type entity
    const type = this.typeRepository.create({
      ...data,
      settings: typeSettings,
      promotional_sliders: promotionalSliders,
      banners,
      shop,
      regions
    });

    return this.typeRepository.save(type);
  }


  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type> {
    // Find the type to be updated
    const type = await this.typeRepository.findOne({
      where: { id },
      relations: ['settings', 'promotional_sliders', 'banners', 'banners.image', 'regions'],
    });

    if (!type) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }

    // Update settings
    if (updateTypeDto.settings) {
      type.settings = this.typeSettingsRepository.merge(type.settings, updateTypeDto.settings);
      await this.typeSettingsRepository.save(type.settings);
    }

    // Update promotional sliders
    if (updateTypeDto.promotional_sliders) {
      const sliderIds = updateTypeDto.promotional_sliders.map(slider => slider.id);
      const sliders = await this.attachmentRepository.findByIds(sliderIds);
      type.promotional_sliders = sliders;
    }

    // Update banners
    if (updateTypeDto.banners) {
      type.banners = await Promise.all(updateTypeDto.banners.map(async (bannerData) => {
        let banner = await this.bannerRepository.findOne({ where: { id: bannerData.id } });
        if (!banner) {
          banner = this.bannerRepository.create();
        }

        banner.title = bannerData.title;
        banner.description = bannerData.description;

        if (bannerData.image && bannerData.image.id) {
          let image = await this.attachmentRepository.findOne({ where: { id: bannerData.image.id } });
          if (!image) {
            image = this.attachmentRepository.create(bannerData.image);
            image = await this.attachmentRepository.save(image);
          }
          banner.image = image;
        }

        return this.bannerRepository.save(banner);
      }));
    }

    // Update regions
    if (updateTypeDto.region_name) {
      const regions = await this.regionRepository.find({
        where: {
          name: In(updateTypeDto.region_name),
        },
      });

      // Check if all requested regions were found
      if (regions.length !== updateTypeDto.region_name.length) {
        const missingRegionNames = updateTypeDto.region_name.filter(
          (name) => !regions.some((region) => region.name === name)
        );
        throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
      }

      type.regions = regions;
    }

    // Update other properties
    if (updateTypeDto.name) {
      type.name = updateTypeDto.name;
    }
    if (updateTypeDto.icon) {
      type.icon = updateTypeDto.icon;
    }
    if (updateTypeDto.language) {
      type.language = updateTypeDto.language;
    }
    if (updateTypeDto.translated_languages) {
      type.translated_languages = updateTypeDto.translated_languages;
    }

    // Save the updated type
    return this.typeRepository.save(type);
  }

  async remove(id: number): Promise<void> {
    const type = await this.typeRepository.findOne({
      where: { id },
      relations: ['settings', 'promotional_sliders', 'banners', 'banners.image', 'categories', 'tags', 'products'],
    });

    if (!type) {
      throw new Error(`Type with ID ${id} not found`);
    }

    // Remove banners and their images
    if (type.banners) {
      for (const banner of type.banners) {
        // Check if the banner has an associated image
        if (banner.image) {
          // Temporarily store the imageId
          const imageId = banner.image.id;
          // Set the image field of the banner to null and save the banner
          banner.image = null;
          await this.bannerRepository.save(banner);
          // Now it's safe to delete the image
          await this.attachmentRepository.delete(imageId);
        }
      }
      // Remove all banners
      const bannerIds = type.banners.map(banner => banner.id);
      if (bannerIds.length > 0) {
        await this.bannerRepository.delete(bannerIds);
      }
    }

    // Remove promotional sliders
    if (type.promotional_sliders) {
      const promotionalSliderIds = type.promotional_sliders.map(slider => slider.id);
      if (promotionalSliderIds.length > 0) {
        // First, remove the promotional sliders from the type
        type.promotional_sliders = [];

        // Save the modified type entity
        await this.typeRepository.save(type);

        // Now delete the references in the join table
        await this.typeRepository
          .createQueryBuilder()
          .delete()
          .from("type_promotional_sliders")
          .where("attachmentId IN (:...ids)", { ids: promotionalSliderIds })
          .execute();

        // Delete the attachments
        await this.attachmentRepository
          .createQueryBuilder()
          .delete()
          .from(Attachment)
          .where("id IN (:...ids)", { ids: promotionalSliderIds })
          .execute();
      }
    }

    // Remove TypeSettings
    if (type.settings) {
      await this.typeSettingsRepository.delete(type.settings.id);
      // Nullify the settings reference in the Type entity
      type.settings = null;
      await this.typeRepository.save(type);
    }

    // Set the typeId to null for all associated categories
    if (type.categories && type.categories.length > 0) {
      await Promise.all(type.categories.map(category => {
        category.type = null;
        return this.categoryRepository.save(category);
      }));
    }

    // Remove associated tags
    if (type.tags && type.tags.length > 0) {
      await this.tagRepository.remove(type.tags);
    }

    // Set the typeId to null for all associated products
    if (type.products && type.products.length > 0) {
      await Promise.all(type.products.map(product => {
        product.type = null;
        return this.productRepository.save(product);
      }));
    }

    // Remove Type
    await this.typeRepository.remove(type);
  }
}
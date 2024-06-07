/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Banner, Type, TypeSettings } from './entities/type.entity';

import typesJson from '@db/types.json';
import Fuse from 'fuse.js';
import { GetTypesDto } from './dto/get-types.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BannerRepository, TypeRepository, TypeSettingsRepository } from './types.repository';
import { convertToSlug } from 'src/helpers';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { UploadsService } from 'src/uploads/uploads.service';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Repository } from 'typeorm';
import { Tag } from 'src/tags/entities/tag.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';

const types = plainToClass(Type, typesJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(types, options);

@Injectable()
export class TypesService {
  constructor(
    private readonly uploadsService: UploadsService,

    @InjectRepository(Type) private readonly typeRepository: TypeRepository,
    @InjectRepository(TypeSettings) private readonly typeSettingsRepository: TypeSettingsRepository,
    @InjectRepository(Banner) private readonly bannerRepository: BannerRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>


  ) { }

  private types: Type[] = types;

  async convertToSlug(text) {
    return await convertToSlug(text);
  }

  async findAll(query: GetTypesDto) {
    let { text, search, shop } = query;

    let data: Type[] = await this.typeRepository.find({ where: { shop: { id: shop } }, relations: ['settings', 'promotional_sliders', 'banners', 'banners.image'] });

    const fuse = new Fuse(data, { keys: ['name', 'slug'] });

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }
      data = fuse.search({
        $and: searchText,
      })?.map(({ item }) => item);
    }

    return data;
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { slug: slug },
      relations: ['settings', 'promotional_sliders', 'banners', 'banners.image', 'products']
    });
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
        if (bannerData.image || bannerData.image.id || bannerData.title) {
          const image = await this.attachmentRepository.findOne({
            where: { id: bannerData.image.id, thumbnail: bannerData.image.thumbnail, original: bannerData.image.original }
          });

          // Create banner entity with the correct title, description, and related image
          const banner = this.bannerRepository.create({
            title: bannerData.title,
            description: bannerData.description,
            image: image,
          });

          return this.bannerRepository.save(banner);
        }
      }));
    }

    // Convert name to slug if present
    if (data.name) {
      data.slug = await this.convertToSlug(data.name);
    }
    const shop = await this.shopRepository.findOne({ where: { id: data.shop_id } });

    // Create and save Type entity
    const type = this.typeRepository.create({ ...data, settings: typeSettings, promotional_sliders: promotionalSliders, banners });
    type.shop = shop; // Correcting the typo here
    return this.typeRepository.save(type);
  }

  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { id },
      relations: ['settings', 'promotional_sliders', 'banners', 'banners.image'],
    });

    if (!type) {
      throw new Error('Type not found');
    }

    // Update settings
    if (updateTypeDto.settings) {
      type.settings = this.typeSettingsRepository.merge(type.settings, updateTypeDto.settings);
      await this.typeSettingsRepository.save(type.settings);
    }

    // Update promotional_sliders
    if (updateTypeDto.promotional_sliders) {
      const sliders = await this.attachmentRepository.findByIds(updateTypeDto.promotional_sliders.map(slider => slider.id));
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
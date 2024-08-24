/* eslint-disable prettier/prettier */
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, ILike, Repository, SelectQueryBuilder } from 'typeorm';
import { TypeRepository } from 'src/types/types.repository';
import { Type } from 'src/types/entities/type.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentRepository } from 'src/common/common.repository';
import { TagRepository } from './tags.repository';
import { Shop } from 'src/shops/entities/shop.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Region } from '../region/entities/region.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagRepository: TagRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Type) private typeRepository: TypeRepository,
    @InjectRepository(Shop) private shopRepository: Repository<Shop>,
    @InjectRepository(Region) private regionRepository: Repository<Region>,

    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache

  ) { }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { name, icon, details, language, translatedLanguages, shopSlug, image, type_id, parent, region_name } = createTagDto;

    // Find the shop by slug
    const shopRes = await this.shopRepository.findOne({ where: { slug: shopSlug } });
    if (!shopRes) {
      throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
    }

    // Find the image by ID if provided
    let imageRes = null;
    if (image?.id) {
      imageRes = await this.attachmentRepository.findOne({ where: { id: image.id } });
      if (!imageRes) {
        throw new NotFoundException(`Image with ID ${image.id} not found`);
      }
    }

    // Find the type by ID if provided
    let typeRes = null;
    if (type_id) {
      typeRes = await this.typeRepository.findOne({ where: { id: type_id } });
      if (!typeRes) {
        throw new NotFoundException(`Type with ID ${type_id} not found`);
      }
    }

    // Find the region by name
    const regionRes = await this.regionRepository.findOne({ where: { name: region_name } });
    if (!regionRes) {
      throw new NotFoundException(`Region with name ${region_name} not found`);
    }

    // Create the new Tag entity
    const tag = new Tag();
    tag.name = name;
    tag.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    tag.parent = parent;
    tag.details = details;
    tag.icon = icon;
    tag.language = language;
    tag.translatedLanguages = translatedLanguages;
    tag.image = imageRes;
    tag.shop = shopRes;
    tag.type = typeRes;
    tag.region = regionRes;  // Associate the region with the tag

    // Save and return the tag
    return await this.tagRepository.save(tag);
  }



  async findAll(query: GetTagsDto) {
    let { limit = '10', page = '1', search, shopSlug, region_name } = query;

    // Convert to numbers
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    // Handle invalid values
    if (isNaN(numericPage) || isNaN(numericLimit)) {
      throw new BadRequestException('Page and limit values must be numbers');
    }

    const skip = (numericPage - 1) * numericLimit;

    // Generate a unique cache key based on the query parameters
    const cacheKey = `tags_${numericPage}_${numericLimit}_${search || 'none'}_${shopSlug || 'none'}_${region_name || 'none'}`;

    // Check if the data is cached
    const cachedData = await this.cacheManager.get<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let shopId: number | undefined;

    // Find shop by slug if provided
    if (shopSlug) {
      const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
      if (!shop) {
        throw new BadRequestException(`Shop with slug ${shopSlug} not found`);
      }
      shopId = shop.id;
    }

    const queryBuilder: SelectQueryBuilder<Tag> = this.tagRepository.createQueryBuilder('tag')
      .leftJoinAndSelect('tag.image', 'image')
      .leftJoinAndSelect('tag.type', 'type')
      .leftJoinAndSelect('tag.region', 'region') // Include region in the query
      .take(numericLimit)
      .skip(skip);

    if (shopId) {
      queryBuilder.andWhere('tag.shopId = :shopId', { shopId });
    }

    if (region_name) {
      queryBuilder.andWhere('region.name = :regionName', { regionName: region_name });
    }

    if (search) {
      const type = await this.typeRepository.findOne({ where: { slug: search } });
      if (type) {
        queryBuilder.andWhere('tag.typeId = :typeId', { typeId: type.id });
      }
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    // Add type_id field to each item in the data array
    const formattedData = data.map((item) => {
      let type_id = null;
      if (item.type) {
        type_id = item.type.id;
      }
      return { ...item, type_id };
    });

    const url = `/tags?search=${search}&limit=${numericLimit}&shopSlug=${shopSlug}&region_name=${region_name}`;
    const response = {
      data: formattedData,
      ...paginate(total, numericPage, numericLimit, formattedData.length, url),
    };

    // Cache the result
    await this.cacheManager.set(cacheKey, response, 3600); // Cache for 1 hour

    return response;
  }


  async findOne(param: string, language: string): Promise<Tag> {
    // Generate a unique cache key based on the tag identifier and language
    const cacheKey = `tag_${param}_${language}`;

    // Check if the data is cached
    const cachedTag = await this.cacheManager.get<Tag>(cacheKey);
    if (cachedTag) {
      return cachedTag;
    }

    const isNumeric = !isNaN(parseFloat(param)) && isFinite(Number(param));
    const whereCondition = isNumeric ? { id: Number(param) } : { slug: param };

    const tag = await this.tagRepository.findOne({
      where: whereCondition,
      relations: ['image', 'type'],
    });

    if (!tag) {
      throw new Error(`Tag with ID or slug ${param} not found`);
    }

    // Cache the result
    await this.cacheManager.set(cacheKey, tag, 3600); // Cache for 5 minutes

    return tag;
  }


  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id }, relations: ['image', 'type'] });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // Check if the image is part of the updateTagDto and different from the current one
    if (updateTagDto.image?.id && updateTagDto.image.id !== tag.image?.id) {
      const referencingTags = await this.tagRepository.find({ where: { image: tag.image } });

      if (referencingTags.length === 1) {
        const image = tag.image;
        tag.image = null;
        await this.tagRepository.save(tag);
        await this.attachmentRepository.remove(image);
      }

      const newImage = await this.attachmentRepository.findOne({ where: { id: updateTagDto.image.id } });
      if (!newImage) {
        throw new NotFoundException('Image not found');
      }
      tag.image = newImage;
    }

    // Check if the type is part of the updateTagDto and different from the current one
    if (updateTagDto.type_id && updateTagDto.type_id !== tag.type?.id) {
      const type = await this.typeRepository.findOne({ where: { id: updateTagDto.type_id } });
      if (!type) {
        throw new NotFoundException('Type not found');
      }
      tag.type = type;
    }

    // Update other fields
    tag.name = updateTagDto.name;
    tag.slug = updateTagDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    tag.parent = updateTagDto.parent;
    tag.details = updateTagDto.details;
    tag.icon = updateTagDto.icon;
    tag.language = updateTagDto.language;
    tag.translatedLanguages = updateTagDto.translatedLanguages;

    return this.tagRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.tagRepository.findOne({ where: { id }, relations: ['image', 'type'] });

    if (!tag) {
      throw new Error(`Tag with ID ${id} not found`);
    }

    // Remove the tag
    await this.tagRepository.remove(tag);

    // Remove related image and type if they are not related to other tags
    // Note: Adjust this logic based on your requirements and database schema
    const relatedTagsImage = await this.tagRepository.findOne({ where: { image: tag.image } });
    if (!relatedTagsImage) {
      await this.attachmentRepository.remove(tag.image);
    }
  }
}

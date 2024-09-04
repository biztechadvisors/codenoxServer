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
import { FindOneOptions, ILike, In, Repository, SelectQueryBuilder } from 'typeorm';
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

    const shopRes = await this.shopRepository.findOne({ where: { slug: shopSlug } });
    if (!shopRes) {
      throw new NotFoundException(`Shop with slug ${shopSlug} not found`);
    }

    let imageRes = null;
    if (image?.id) {
      imageRes = await this.attachmentRepository.findOne({ where: { id: image.id } });
      if (!imageRes) {
        throw new NotFoundException(`Image with ID ${image.id} not found`);
      }
    }

    let typeRes = null;
    if (type_id) {
      typeRes = await this.typeRepository.findOne({ where: { id: type_id } });
      if (!typeRes) {
        throw new NotFoundException(`Type with ID ${type_id} not found`);
      }
    }

    const regions = await this.regionRepository.find({
      where: {
        name: In(createTagDto.region_name),
      },
    });

    // Check if all requested regions were found
    if (regions.length !== createTagDto.region_name.length) {
      const missingRegionNames = createTagDto.region_name.filter(
        (name) => !regions.some((region) => region.name === name)
      );
      throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
    }

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
    tag.regions = regions;  // Associate the region with the tag

    return await this.tagRepository.save(tag);
  }

  async findAll(query: GetTagsDto) {
    let { limit = '10', page = '1', search, shopSlug, region_name } = query;

    // Convert to numbers
    const numericPage = Number(page);
    const numericLimit = Number(limit);

    // Handle invalid values
    if (isNaN(numericPage) || isNaN(numericLimit) || numericPage < 1 || numericLimit < 1) {
      throw new BadRequestException('Page and limit values must be positive numbers');
    }

    const skip = (numericPage - 1) * numericLimit;

    // Convert region_name to an array if it's a string
    const regionNames = typeof region_name === 'string' ? [region_name] : region_name || [];

    // Generate a unique cache key based on the query parameters
    const cacheKey = `tags_${numericPage}_${numericLimit}_${search || 'none'}_${shopSlug || 'none'}_${regionNames.join(',')}`;

    // Check if the data is cached
    const cachedData = await this.cacheManager.get<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let shopId: number | undefined;
    let regionIds: number[] = [];

    // Find shop by slug if provided
    if (shopSlug) {
      const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
      if (!shop) {
        throw new BadRequestException(`Shop with slug ${shopSlug} not found`);
      }
      shopId = shop.id;
    }

    // Find regions by names if provided
    if (regionNames.length > 0) {
      const regions = await this.regionRepository.find({
        where: { name: In(regionNames) },
      });

      // Check if all requested regions were found
      if (regions.length !== regionNames.length) {
        const missingRegionNames = regionNames.filter(
          (name) => !regions.some((region) => region.name === name)
        );
        throw new BadRequestException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
      }
      regionIds = regions.map(region => region.id);
    }

    const queryBuilder: SelectQueryBuilder<Tag> = this.tagRepository.createQueryBuilder('tag')
      .leftJoinAndSelect('tag.image', 'image')
      .leftJoinAndSelect('tag.type', 'type')
      .leftJoinAndSelect('tag.regions', 'region')
      .take(numericLimit)
      .skip(skip);

    if (shopId) {
      queryBuilder.andWhere('tag.shopId = :shopId', { shopId });
    }

    if (regionIds.length > 0) {
      queryBuilder.andWhere('region.id IN (:...regionIds)', { regionIds });
    }

    if (search) {
      // Use `LOWER` for case-insensitive search
      queryBuilder.andWhere('LOWER(tag.name) LIKE LOWER(:search)', { search: `%${search.toLowerCase()}%` });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    // Add type_id field to each item in the data array
    const formattedData = data.map((item) => ({
      ...item,
      type_id: item.type?.id || null,
    }));

    const url = `/tags?search=${search}&limit=${numericLimit}&shopSlug=${shopSlug}&region_name=${regionNames.join(',')}`;
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
    const tag = await this.tagRepository.findOne({ where: { id }, relations: ['image', 'type', 'regions'] });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    if (updateTagDto.image?.id && updateTagDto.image.id !== tag.image?.id) {
      const referencingTags = await this.tagRepository.find({ where: { image: tag.image } });

      if (referencingTags.length === 1) {
        const oldImage = tag.image;
        tag.image = null;
        await this.tagRepository.save(tag);
        await this.attachmentRepository.remove(oldImage);
      }

      const newImage = await this.attachmentRepository.findOne({ where: { id: updateTagDto.image.id } });
      if (!newImage) {
        throw new NotFoundException('Image not found');
      }
      tag.image = newImage;
    }

    if (updateTagDto.type_id && updateTagDto.type_id !== tag.type?.id) {
      const type = await this.typeRepository.findOne({ where: { id: updateTagDto.type_id } });
      if (!type) {
        throw new NotFoundException('Type not found');
      }
      tag.type = type;
    }

    // Handle regions
    if (updateTagDto.region_name && updateTagDto.region_name.length > 0) {
      // Find all regions that match the names provided
      const regions = await this.regionRepository.find({
        where: {
          name: In(updateTagDto.region_name),
        },
      });

      // Check if all requested regions were found
      if (regions.length !== updateTagDto.region_name.length) {
        const missingRegionNames = updateTagDto.region_name.filter(
          (name) => !regions.some((region) => region.name === name)
        );
        throw new NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
      }

      tag.regions = regions; // Correctly assign the array of regions
    }

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

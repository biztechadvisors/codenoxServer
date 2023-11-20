/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import tagsJson from '@db/tags.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { TypeRepository } from 'src/types/types.repository';
import { Type } from 'src/types/entities/type.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentRepository } from 'src/common/common.repository';
import { TagRepository } from './tags.repository';

const tags = plainToClass(Tag, tagsJson)

const options = {
  keys: ['name'],
  threshold: 0.3,
}
const fuse = new Fuse(tags, options)

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagRepository: TagRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Type) private typeRepository: TypeRepository,
  ) { }


  private tags: Tag[] = tags;

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const imageId = createTagDto.image.id;
    const imageOptions: FindOneOptions<Attachment> = {
      where: { id: imageId },
    };

    const image = await this.attachmentRepository.findOne(imageOptions);
    if (!image) {
      throw new Error(`Image with ID ${imageId} not found`);
    }

    const typeId = createTagDto.type_id; // Changed from createTagDto.type.id to createTagDto.type_id
    const typeOptions: FindOneOptions<Type> = {
      where: { id: typeId },
    };

    const type = await this.typeRepository.findOne(typeOptions);
    if (!type) {
      throw new Error(`Type with ID ${typeId} not found`);
    }

    const tag = new Tag();
    tag.name = createTagDto.name;
    tag.slug = createTagDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    tag.parent = createTagDto.parent;
    tag.details = createTagDto.details;
    tag.icon = createTagDto.icon;
    tag.type = type;
    tag.language = createTagDto.language;
    tag.translatedLanguages = createTagDto.translatedLanguages;
    tag.image = image;

    return await this.tagRepository.save(tag);
  }

  async findAll({ page, limit, search }: GetTagsDto) {
    let data: Tag[] = await this.tagRepository.find({
      relations: ['image', 'type'],
    });

    if (search) {
      const parseSearchParams = search.split(';')
      const searchText: any = []
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':')
        console.log(value, 'value')
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          })
        }
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item)
    }

    const url = `/tags?limit=${limit}`
    return {
      data,
      ...paginate(this.tags.length, page, limit, this.tags.length, url),
    }
  }

  async findOne(param: string, language: string): Promise<Tag> {
    const isNumeric = !isNaN(parseFloat(param)) && isFinite(Number(param));
    const whereCondition = isNumeric ? { id: Number(param) } : { slug: param };

    const tag = await this.tagRepository.findOne({
      where: whereCondition,
      relations: ['image', 'type'],
    });

    if (!tag) {
      throw new Error(`Tag with ID or slug ${param} not found`);
    }

    return tag;
  }


  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id }, relations: ['image', 'type'] });
    console.log("Ram********************", tag)
    if (!tag) {
      throw new Error(`Tag with ID ${id} not found`);
    }

    // Check if the image is part of the updateTagDto and different from the current one
    if (updateTagDto.image && updateTagDto.image.id !== tag.image.id) {
      const referencingTags = await this.tagRepository.find({ where: { image: tag.image } });

      if (referencingTags.length === 1) {
        const image = tag.image;
        tag.image = null;
        await this.tagRepository.save(tag);
        await this.attachmentRepository.remove(image);
      }

      const newImage = await this.attachmentRepository.findOne({ where: { id: updateTagDto.image.id } });
      if (!newImage) {
        throw new Error('Image not found');
      }
      tag.image = newImage;
    }

    // Check if the type is part of the updateTagDto and different from the current one
    if (updateTagDto.type && updateTagDto.type.id !== tag.type.id) {
      const type = await this.typeRepository.findOne({ where: { id: updateTagDto.type_id } });
      if (!type) {
        throw new Error('Type not found');
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
    tag.translatedLanguages = updateTagDto.translated_languages;

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

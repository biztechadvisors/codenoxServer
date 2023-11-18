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
import { Repository } from 'typeorm';
import { TypeRepository } from 'src/types/types.repository';
import { Type } from 'src/types/entities/type.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentRepository } from 'src/common/common.repository';
import { TagRepository } from './tags.repository';

const tags = plainToClass(Tag, tagsJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(tags, options);

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag) private tagRepository: TagRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Type) private typeRepository: TypeRepository,
  ) { }


  private tags: Tag[] = tags;

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const newTag = new Tag();
    newTag.name = createTagDto.name;
    newTag.slug = createTagDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    newTag.details = createTagDto.details;
    newTag.icon = createTagDto.icon;
    newTag.language = createTagDto.language;

    // Check if the image is part of the createTagDto
    if (createTagDto.image && createTagDto.image.id) {
      const image = await this.attachmentRepository.findOne({ where: { id: createTagDto.image.id } });
      console.log("first", createTagDto.image.id, image)
      if (!image) {
        throw new Error('Image not found');
      }
      newTag.image = image;
    }

    if (createTagDto.type && createTagDto.type.id) {
      const type = await this.typeRepository.findOne({ where: { id: createTagDto.type.id } });
      if (!type) {
        throw new Error('Type not found');
      }
      newTag.type = type;
    }

    return this.tagRepository.save(newTag);
  }


  findAll({ page, limit, search }: GetTagsDto) {
    if (!page) page = 1;
    let data: Tag[] = this.tags;
    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        console.log(value, 'value');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    const url = `/tags?limit=${limit}`;
    return {
      data,
      ...paginate(this.tags.length, page, limit, this.tags.length, url),
    };
  }

  findOne(param: string, language: string) {
    return this.tags.find((p) => p.id === Number(param) || p.slug === param);
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.tags[0];
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}

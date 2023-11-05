import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type, TypeSettings } from './entities/type.entity';

import typesJson from '@db/types.json';
import Fuse from 'fuse.js';
import { GetTypesDto } from './dto/get-types.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BannerRepoditory, TypeRepository, TypeSettingsRepository } from './types.repository';
import { convertToSlug } from 'src/helpers';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { UploadsService } from 'src/uploads/uploads.service';

const types = plainToClass(Type, typesJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(types, options);

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(TypeRepository) private typeRepository: TypeRepository,
    @InjectRepository(TypeSettingsRepository) private typeSettingsRepository: TypeSettingsRepository,
    @InjectRepository(BannerRepoditory) private bannerRepoditory: BannerRepoditory,
    @InjectRepository(AttachmentRepository) private attachmentRepository: AttachmentRepository,
    private uploadsService: UploadsService
  ) { }

  private types: Type[] = types;

  async convertToSlug(text) {
    return await convertToSlug(text);
  }

  getTypes({ text, search }: GetTypesDto) {
    let data: Type[] = this.types;
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

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    return data;
  }

  getTypeBySlug(slug: string): Type {
    return this.types.find((p) => p.slug === slug);
  }

  async create(createTypeDto: CreateTypeDto): Promise<Type> {
    const typeSettings = await this.typeSettingsRepository.save(createTypeDto.settings);
    // const attachments = await Promise.all(createTypeDto.promotionalSliderIds.map(async (id) => {
    //   const attachment = await this.attachmentRepository.findOne(id);
    //   if (!attachment) {
    //     throw new Error(`Attachment with ID ${id} does not exist.`);
    //   }
    //   return attachment;
    // }));

    const type = new Type();
    type.name = createTypeDto.name;
    type.slug = createTypeDto.slug;
    type.icon = createTypeDto.icon;
    type.language = createTypeDto.language;
    type.translated_languages = createTypeDto.translated_languages;
    type.settings = typeSettings;
    // type.promotional_sliders = attachments;

    return await this.typeRepository.save(type);
  }

  findAll() {
    return `This action returns all types`;
  }

  findOne(id: number) {
    return `This action returns a #${id} type`;
  }

  update(id: number, updateTypeDto: UpdateTypeDto) {
    return this.types[0];
  }

  remove(id: number) {
    return `This action removes a #${id} type`;
  }
}

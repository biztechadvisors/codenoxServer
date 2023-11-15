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
import { error } from 'console';
import { AttachmentDTO } from 'src/common/dto/attachment.dto';

const types = plainToClass(Type, typesJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(types, options);

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(Type) private readonly typeRepository: TypeRepository,
    @InjectRepository(TypeSettings) private readonly typeSettingsRepository: TypeSettingsRepository,
    @InjectRepository(Banner) private readonly bannerRepository: BannerRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    private readonly uploadsService: UploadsService,
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
    try {
      const newSettings = new TypeSettings();
      Object.assign(newSettings, createTypeDto.settings);
      const savedSettings = await this.typeSettingsRepository.save(newSettings);

      const newType = new Type();
      Object.assign(newType, createTypeDto, { settings: savedSettings });

      if (createTypeDto.image) {
        newType.image = await this.attachmentRepository.findOne({ where: { id: createTypeDto.image.id } });
      }

      if (createTypeDto.promotional_sliders) {
        newType.promotional_sliders = await this.attachmentRepository.findByIds(createTypeDto.promotional_sliders.map(slider => slider.id));
      }

      const savedType = await this.typeRepository.save(newType);

      if (createTypeDto.banners) {
        for (const bannerDto of createTypeDto.banners) {
          const banner = new Banner();
          banner.title = bannerDto.title;
          banner.description = bannerDto.description;
          banner.image = await this.attachmentRepository.findOne({ where: { id: bannerDto.image[0].id } });
          banner.type = savedType; // Set the type of the banner here
          await this.bannerRepository.save(banner);
        }
      }

      console.log("Ram***")
      return savedType;

    } catch (error) {
      console.error('Error creating type:', error);
      throw error;
    }
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

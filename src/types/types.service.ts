import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { BannerDTO, CreateTypeDto } from './dto/create-type.dto';
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
      const typeSettingsDTO = createTypeDto.settings;
      const typeSettings = new TypeSettings();
      typeSettings.isHome = typeSettingsDTO.isHome;
      typeSettings.layoutType = typeSettingsDTO.layoutType;
      typeSettings.productCard = typeSettingsDTO.productCard;
      await this.typeSettingsRepository.save(typeSettings);

      console.log("first")
      const validBanners: Banner[] = [];
      if (createTypeDto.banners) {
        for (const bannerDTO of createTypeDto.banners) {
          try {
            const newBanner = new Banner();
            newBanner.title = bannerDTO.title;
            newBanner.description = bannerDTO.description;
            const existingImage = await this.attachmentRepository.findOne({
              where: { id: bannerDTO.image.id },
            });
            if (!existingImage) {
              throw new Error(`Image with ID ${bannerDTO.image.id} does not exist.`);
            }
            newBanner.image = existingImage;
            await this.bannerRepository.manager.save(newBanner);
            validBanners.push(newBanner);
          } catch (error) {
            console.error('Error saving banner:', error);
            // handle the error appropriately
          }
        }
      }

      console.log("four")

      const validPromotionalSliders: Attachment[] = [];
      if (createTypeDto.promotionalSliders) {
        console.log("five")
        for (const attachmentDTO of createTypeDto.promotionalSliders) {
          console.log("six")
          const existingAttachment = await this.attachmentRepository.findOne({
            where: {
              id: attachmentDTO.id,
            },
          });
          if (!existingAttachment) {
            throw new Error(`Attachment with ID ${attachmentDTO.id} does not exist.`);
          }
          if (!validPromotionalSliders.find(slider => slider.id === existingAttachment.id)) {
            validPromotionalSliders.push(existingAttachment);
          }
        }
      }
      console.log("seven")
      const type = new Type();
      type.name = createTypeDto.name;
      type.slug = createTypeDto.slug;
      type.icon = createTypeDto.icon;
      type.language = createTypeDto.language;
      type.translated_languages = createTypeDto.translatedLanguages;
      type.settings = typeSettings;
      console.log("eight")
      const existingImage = await this.attachmentRepository.findOne({
        where: { id: createTypeDto.image.id },
      });
      console.log("nine")
      if (!existingImage) {
        throw new Error(`Image with ID ${createTypeDto.image.id} does not exist.`);
      }
      console.log("ten-10")
      type.image = existingImage;
      console.log("Type-Data", type);
      return await this.typeRepository.save(type);
    } catch (error) {
      throw new InternalServerErrorException(error);
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

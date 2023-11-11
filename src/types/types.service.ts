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
      // Save TypeSettings first
      const typeSettings = new TypeSettings();
      typeSettings.isHome = createTypeDto.settings.isHome;
      typeSettings.layoutType = createTypeDto.settings.layoutType;
      typeSettings.productCard = createTypeDto.settings.productCard;
      await this.typeSettingsRepository.save(typeSettings);

      // Save valid Banners
      const validBanners: Banner[] = [];
      if (createTypeDto.banners) {
        for (const bannerDTO of createTypeDto.banners) {
          try {
            const existingImage = await this.attachmentRepository.findOne({
              where: { id: bannerDTO.image.id },
            });

            if (!existingImage) {
              throw new Error(`Image with ID ${bannerDTO.image.id} does not exist.`);
            }

            const newBanner = new Banner();
            newBanner.title = bannerDTO.title;
            newBanner.description = bannerDTO.description;
            newBanner.image = existingImage;
            await this.bannerRepository.save(newBanner);
            validBanners.push(newBanner);
          } catch (error) {
            console.error('Error saving banner:', error);
            // handle the error appropriately
          }
        }
      }

      // Save valid Promotional Sliders
      const validPromotionalSliders: Attachment[] = [];
      if (createTypeDto.promotionalSliders) {
        const seenPromotionalSliderIds: Set<number> = new Set();
        for (const promotionalSliderDTO of createTypeDto.promotionalSliders) {
          if (!seenPromotionalSliderIds.has(promotionalSliderDTO.id)) {
            const existingImage = await this.attachmentRepository.findOne({
              where: { id: promotionalSliderDTO.id },
            });

            if (!existingImage) {
              throw new Error(`Image with ID ${promotionalSliderDTO.id} does not exist.`);
            }

            validPromotionalSliders.push(existingImage);
            seenPromotionalSliderIds.add(promotionalSliderDTO.id);
          }
        }
      }

      // Create and save the new Type
      const newType = new Type();
      newType.name = createTypeDto.name;
      newType.slug = createTypeDto.slug;
      // newType.image = await this.attachmentRepository.findOne({
      //   where: { id: createTypeDto.image.id },
      // });
      newType.icon = createTypeDto.icon;
      newType.banners = validBanners;
      newType.promotional_sliders = validPromotionalSliders;
      newType.settings = typeSettings;
      newType.language = createTypeDto.language;
      newType.translated_languages = createTypeDto.translatedLanguages;

      await this.typeRepository.save(newType);
      return newType;
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

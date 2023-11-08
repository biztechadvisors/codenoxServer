import { Injectable } from '@nestjs/common';
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

  async create(createTypeDto: CreateTypeDto): Promise<Type | { bannerId: number }> {
    try {
      // Validate and create TypeSettings object
      const typeSettingsDTO = createTypeDto.settings;
      const typeSettings = new TypeSettings();
      typeSettings.isHome = typeSettingsDTO.isHome;
      typeSettings.layoutType = typeSettingsDTO.layoutType;
      typeSettings.productCard = typeSettingsDTO.productCard;

      // Save the TypeSettings object
      await this.typeSettingsRepository.save(typeSettings);

      // Get valid banner IDs and validate banner attachments
      const validBannerIds: number[] = [];
      const bannerAttachments: AttachmentDTO[] = [];

      if (createTypeDto.banners) {
        for (const bannerDTO of createTypeDto.banners) {
          // Check if the banner is already associated with the type
          const existingBanner = await this.bannerRepository.findOne({
            where: { id: bannerDTO.image.id },
          });

          if (!existingBanner) {
            throw new Error(`Banner with ID ${bannerDTO.image.id} does not exist.`);
          }

          // Check if the banner is already associated with the type
          // const existingTypeBanner = await this.bannerRepository.findOne({
          //   where: {  bannerId: existingBanner.id },
          // });

          // if (existingTypeBanner) {
          //   // Skip insertion if the banner already exists
          //   continue;
          // }

          // Save the banner if it's not already associated with the type
          validBannerIds.push(existingBanner.id);
          const bannerAttachment = await this.uploadsService.uploadFile(bannerDTO.image[0]);
          bannerAttachments.push(bannerAttachment[0]);
        }
      }

      // Get valid promotional slider IDs and validate promotional slider attachments
      const validPromotionalSliderIds: number[] = [];
      const promotionalSliderAttachments: AttachmentDTO[] = [];

      if (createTypeDto.promotionalSliders) {
        for (const attachmentDTO of createTypeDto.promotionalSliders) {
          const existingAttachment = await this.attachmentRepository.findOne({
            where: {
              id: attachmentDTO.id,
            },
          });

          if (!existingAttachment) {
            throw new Error(`Attachment with ID ${attachmentDTO.id} does not exist.`);
          }

          validPromotionalSliderIds.push(existingAttachment.id);

          if (attachmentDTO) {
            const promotionalSliderAttachment = await this.uploadsService.uploadFile(attachmentDTO[0]);
            promotionalSliderAttachments.push(promotionalSliderAttachment[0]);
          }
        }
      }

      // Create a new Type object
      const type = new Type();
      type.name = createTypeDto.name;
      type.slug = createTypeDto.slug;
      type.icon = createTypeDto.icon;
      type.language = createTypeDto.language;
      type.translated_languages = createTypeDto.translatedLanguages;
      type.settings = typeSettings;

      // Set banners if provided
      if (validBannerIds.length > 0) {
        type.banners = validBannerIds.map((bannerId) => {
          return bannerId[0];
        });
      }

      // Set promotional sliders if provided
      if (validPromotionalSliderIds.length > 0) {
        type.promotional_sliders = validPromotionalSliderIds.map((attachmentId) => {
          return attachmentId[0];
        });
      }

      // Save the Type object
      await this.typeRepository.save(type);

      // Return the saved Type object
      return type;
    } catch (error) {
      // Handle and log any errors here
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

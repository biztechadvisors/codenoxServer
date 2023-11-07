import { Injectable } from '@nestjs/common';
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
    // Validate and create TypeSettings object
    const typeSettings = new TypeSettings();
    if (createTypeDto.settings) {
      typeSettings.isHome = createTypeDto.settings.isHome;
      typeSettings.layoutType = createTypeDto.settings.layoutType;
      typeSettings.productCard = createTypeDto.settings.productCard;
    }
    // Save the TypeSettings object
    await this.typeSettingsRepository.save(typeSettings);
    // Validate and collect valid banner IDs
    const validBannerIds = [];
    console.log("banners", createTypeDto.bannerIds)
    console.log("promotionalSliderIds", createTypeDto.promotionalSliderIds)
    console.log("image", createTypeDto.image)


    if (createTypeDto.promotionalSliderIds) {
      for (const bannerId of createTypeDto.promotionalSliderIds) {
        console.log("bannersId", bannerId)
        const banner = await this.bannerRepository.findOne({
          where: { id: bannerId },
        });
        if (!banner) {
          throw new Error(`Banner with ID ${bannerId} does not exist.`);
        }
        validBannerIds.push(banner.id);
      }
    }
    // Create a new Type object
    const type = new Type();
    type.name = createTypeDto.name;
    type.slug = createTypeDto.slug;
    type.icon = createTypeDto.icon;
    type.language = createTypeDto.language;
    type.translated_languages = createTypeDto.translated_languages;
    type.settings = typeSettings;
    // Set promotional sliders if provided
    if (validBannerIds.length > 0) {
      type.promotional_sliders = validBannerIds;
    }
    // Save the Type object
    await this.typeRepository.save(type);
    // Return the saved Type object
    return type;
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

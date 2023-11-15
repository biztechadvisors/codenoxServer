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

  async findAll(query: any) {
    return this.typeRepository.find({
      where: query,
      relations: ['settings', 'promotional_sliders', 'banners', 'banners.image']
    });
  }

  async getTypes({ text, search }: GetTypesDto) {
    let data: Type[] = await this.findAll({});
    const fuse = new Fuse(data, { keys: ['name', 'slug'] }); // adjust this according to your needs
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

  async getTypeBySlug(slug: string): Promise<Type> {
    return await this.typeRepository.findOne({ where: { slug }, relations: ['settings', 'promotional_sliders', 'banners', 'banners.image'] });
  }


  async create(data: CreateTypeDto) {
    console.log("Data-Type")
    const typeSettings = this.typeSettingsRepository.create(data.settings);
    await this.typeSettingsRepository.save(typeSettings);
    let promotionalSliders = [];
    if (data.promotional_sliders && Array.isArray(data.promotional_sliders)) {
      promotionalSliders = await this.attachmentRepository.findByIds(data.promotional_sliders.map(slider => slider.id));
    }
    let banners = [];
    if (data.banners && Array.isArray(data.banners)) {
      banners = await Promise.all(data.banners.map(async (bannerData) => {
        if (bannerData.image && bannerData.image.length > 0) {
          const image = await this.attachmentRepository.findOne({ where: { id: bannerData.image[0].id } });
          const { image: _, ...bannerDataWithoutImage } = bannerData;
          const banner = this.bannerRepository.create({ ...bannerDataWithoutImage, image });
          return this.bannerRepository.save(banner);
        }
      }));
    }
    if (data.name) {
      data.slug = await this.convertToSlug(data.name);
    }
    const type = this.typeRepository.create({ ...data, settings: typeSettings, promotional_sliders: promotionalSliders, banners });
    return this.typeRepository.save(type);
  }

  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type> {
    console.log("ID***", id)
    console.log("updateTypeDto", updateTypeDto)
    const type = await this.typeRepository.findOne({ where: { id }, relations: ['settings', 'promotional_sliders', 'banners'] });
    if (!type) {
      throw new Error('Type not found');
    }
    // Update TypeSettings
    if (updateTypeDto.settings) {
      type.settings.isHome = updateTypeDto.settings.isHome;
      type.settings.layoutType = updateTypeDto.settings.layoutType;
      type.settings.productCard = updateTypeDto.settings.productCard;
      await this.typeSettingsRepository.save(type.settings);
    }
    // Update promotional_sliders
    if (updateTypeDto.promotional_sliders) {
      type.promotional_sliders = await this.attachmentRepository.findByIds(updateTypeDto.promotional_sliders.map(slider => slider.id));
    }
    // Update banners
    if (updateTypeDto.banners) {
      for (const bannerData of updateTypeDto.banners) {
        let banner = type.banners.find(banner => banner.id === bannerData.image[0].id);
        if (!banner) {
          banner = new Banner();
          type.banners.push(banner);
        }
        banner.title = bannerData.title;
        banner.description = bannerData.description;
        if (bannerData.image && bannerData.image.length > 0) {
          banner.image = await this.attachmentRepository.findOne({ where: { id: bannerData.image[0].id } });
        }
        console.log("Banner*****", banner)
        await this.bannerRepository.save(banner);
      }
    }
    // Update other Type properties
    type.name = updateTypeDto.name;
    type.slug = await this.convertToSlug(updateTypeDto.name);
    type.icon = updateTypeDto.icon;
    type.language = updateTypeDto.language;
    type.translated_languages = updateTypeDto.translated_languages;

    return this.typeRepository.save(type);
  }

  async remove(id: number): Promise<void> {
    const type = await this.typeRepository.findOne({ where: { id }, relations: ['settings', 'promotional_sliders', 'banners', 'banners.image'] });
    if (!type) {
      throw new Error(`Type with ID ${id} not found`);
    }

    // Remove banners and their images
    if (type.banners) {
      await Promise.all(type.banners.map(async (banner) => {
        if (banner.image) {
          await this.bannerRepository.delete(banner.id);
        }
      }));
    }

    // Remove promotional_sliders
    if (type.promotional_sliders) {
      await Promise.all(type.promotional_sliders.map(slider => this.attachmentRepository.delete(slider.id)));
    }

    // Remove Type
    await this.typeRepository.remove(type);

    // Remove TypeSettings
    if (type.settings) {
      await this.typeSettingsRepository.delete(type.settings.id);
    }
  }
}

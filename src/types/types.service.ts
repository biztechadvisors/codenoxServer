/* eslint-disable prettier/prettier */
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
import { AttachmentDTO } from 'src/common/dto/attachment.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Repository } from 'typeorm';

const types = plainToClass(Type, typesJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(types, options);

@Injectable()
export class TypesService {
  constructor(
    private readonly uploadsService: UploadsService,

    @InjectRepository(Type) private readonly typeRepository: TypeRepository,
    @InjectRepository(TypeSettings) private readonly typeSettingsRepository: TypeSettingsRepository,
    @InjectRepository(Banner) private readonly bannerRepository: BannerRepository,
    @InjectRepository(Attachment) private readonly attachmentRepository: AttachmentRepository,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>

  ) { }

  private types: Type[] = types;

  async convertToSlug(text) {
    return await convertToSlug(text);
  }

  async findAll(query: GetTypesDto) {
    console.log("query ", query);
    let { text, search, shop } = query;

    let data: Type[] = await this.typeRepository.find({ where: { shop: { id: shop } }, relations: ['settings', 'promotional_sliders', 'banners', 'banners.image'] });

    const fuse = new Fuse(data, { keys: ['name', 'slug'] });

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
      data = fuse.search({
        $and: searchText,
      })?.map(({ item }) => item);
    }

    return data;
  }

  async getTypeBySlug(slug: string): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { slug },
      relations: ['settings', 'promotional_sliders', 'banners', 'banners.image', 'product']
    });
    return type;
  }

  async create(data: CreateTypeDto) {

    // Create and save TypeSettings
    const typeSettings = this.typeSettingsRepository.create(data.settings);
    await this.typeSettingsRepository.save(typeSettings);

    // Fetch promotional sliders
    let promotionalSliders = [];
    if (data.promotional_sliders && Array.isArray(data.promotional_sliders)) {
      promotionalSliders = await this.attachmentRepository.findByIds(data.promotional_sliders.map(slider => slider.id));
    }

    // Create and save banners with associated images
    let banners = [];
    if (data.banners && Array.isArray(data.banners)) {

      console.log('data.banners', data.banners)
      banners = await Promise.all(data.banners.map(async (bannerData) => {
        if (bannerData.image || bannerData.image.id || bannerData.title) {
          const image = await this.attachmentRepository.findOne({
            where: { id: bannerData.image.id, thumbnail: bannerData.image.thumbnail, original: bannerData.image.original }
          });

          // Create banner entity with the correct title, description, and related image
          const banner = this.bannerRepository.create({
            title: bannerData.title,
            description: bannerData.description,
            image: image,
          });

          console.log('banner', banner)
          return this.bannerRepository.save(banner);
        }
      }));
    }

    // Convert name to slug if present
    if (data.name) {
      data.slug = await this.convertToSlug(data.name);
    }
    const shop = await this.shopRepository.findOne({ where: { id: data.shop_id } });

    // Create and save Type entity
    const type = this.typeRepository.create({ ...data, settings: typeSettings, promotional_sliders: promotionalSliders, banners });
    type.shop = shop; // Correcting the typo here
    return this.typeRepository.save(type);
  }

  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const type = await this.typeRepository.findOne({ where: { id }, relations: ['settings', 'promotional_sliders', 'banners'] });
    if (!type) {
      throw new Error('Type not found');
    }

    // Update settings
    if (updateTypeDto.settings) {
      type.settings = this.typeSettingsRepository.merge(type.settings, updateTypeDto.settings);
      await this.typeSettingsRepository.save(type.settings);
    }

    // Update promotional_sliders
    if (updateTypeDto.promotional_sliders) {
      type.promotional_sliders = await Promise.all(updateTypeDto.promotional_sliders.map(async (sliderData) => {
        let slider = await this.attachmentRepository.findOne({ where: { id: sliderData.id } });
        if (!slider) {
          slider = new Attachment();
        }
        slider = this.attachmentRepository.merge(slider, sliderData);
        return this.attachmentRepository.save(slider);
      }));
    }

    if (updateTypeDto.banners) {
      type.banners = await Promise.all(updateTypeDto.banners.map(async (bannerData) => {
        let banner = await this.bannerRepository.findOne({ where: { id: bannerData.id } });
        if (!banner) {
          banner = new Banner();
        }
        banner.title = bannerData.title;
        banner.description = bannerData.description;
        if (bannerData.image && bannerData.image) {
          // Create a new image record for each banner
          let image = new Attachment();
          image = this.attachmentRepository.merge(image, bannerData.image);
          banner.image = await this.attachmentRepository.save(image);
        }
        return this.bannerRepository.save(banner);
      }));
    }


    // Update other properties
    type.name = updateTypeDto.name;
    type.icon = updateTypeDto.icon;
    type.language = updateTypeDto.language;
    type.translated_languages = updateTypeDto.translated_languages;

    // Save the updated type
    await this.typeRepository.save(type);

    return type;
  }

  async remove(id: number): Promise<void> {
    const type = await this.typeRepository.findOne({ where: { id }, relations: ['settings', 'promotional_sliders', 'banners', 'banners.image'] });
    if (!type) {
      throw new Error(`Type with ID ${id} not found`);
    }

    // Remove banners and their images
    if (type.banners) {
      const bannerIds = type.banners.map(banner => banner.id);
      const imageIds = type.banners.filter(banner => banner.image).map(banner => banner.image.id);
      if (bannerIds.length > 0) {
        await this.bannerRepository.delete(bannerIds);
      }
      if (imageIds.length > 0) {
        await this.attachmentRepository.delete(imageIds);
      }
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




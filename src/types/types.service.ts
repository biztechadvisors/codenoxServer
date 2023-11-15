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

    const promotionalSliders = await this.attachmentRepository.findByIds(data.promotional_sliders.map(slider => slider.id));

    const banners = await Promise.all(data.banners.map(async (bannerData) => {
      if (bannerData.image && bannerData.image.length > 0) {
        const image = await this.attachmentRepository.findOne({ where: { id: bannerData.image[0].id } });
        const { image: _, ...bannerDataWithoutImage } = bannerData;
        const banner = this.bannerRepository.create({ ...bannerDataWithoutImage, image });
        return this.bannerRepository.save(banner);
      }
    }));

    const type = this.typeRepository.create({ ...data, settings: typeSettings, promotional_sliders: promotionalSliders, banners });
    return this.typeRepository.save(type);
  }


  update(id: number, updateTypeDto: UpdateTypeDto) {
    return this.types[0];
  }

  remove(id: number) {
    return `This action removes a #${id} type`;
  }
}

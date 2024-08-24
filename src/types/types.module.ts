/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner, Type, TypeSettings } from './entities/type.entity';
import { BannerRepository, TypeRepository, TypeSettingsRepository } from './types.repository';
import { UploadsService } from 'src/uploads/uploads.service';
import { AttachmentRepository } from 'src/common/common.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Region } from '../region/entities/region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Type, Region, Product, TypeSettings, Banner, Attachment, Shop, Tag, Category]),
    CacheModule.register()
  ],
  controllers: [TypesController],
  providers: [TypesService, UploadsService, TypeRepository, TypeSettingsRepository, BannerRepository, AttachmentRepository],
})
export class TypesModule { }

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Type } from 'src/types/entities/type.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { Region } from '../region/entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Attachment, Type, Shop, Region]),
  CacheModule.register()],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule { }

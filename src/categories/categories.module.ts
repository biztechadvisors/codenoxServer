/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CategoriesController, SubCategoriesController } from './categories.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category, SubCategory } from './entities/category.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { Region } from '../region/entities/region.entity'
import { Attachment } from '../common/entities/attachment.entity'
import { Type } from '../types/entities/type.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Shop, SubCategory, Region, Attachment, Type]),
    CacheModule.register()
  ],
  controllers: [CategoriesController, SubCategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule { }

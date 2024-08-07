/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CategoriesController, SubCategoriesController } from './categories.controller'
import { CategoryRepository } from './categories.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { AttachmentRepository } from 'src/common/common.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category, SubCategory } from './entities/category.entity'
import { TypeRepository } from 'src/types/types.repository'
import { Shop } from 'src/shops/entities/shop.entity'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      CategoryRepository,
      AttachmentRepository,
      TypeRepository,
    ]),
    TypeOrmModule.forFeature([Category, Shop, SubCategory]),
    CacheModule.register()
  ],
  controllers: [CategoriesController, SubCategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule { }

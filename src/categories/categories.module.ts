/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { CategoriesController } from './categories.controller'
import { CategoryRepository } from './categories.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { AttachmentRepository } from 'src/common/common.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { TypeRepository } from 'src/types/types.repository'

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      CategoryRepository,
      AttachmentRepository,
      TypeRepository,
    ]),
    TypeOrmModule.forFeature([Category]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}

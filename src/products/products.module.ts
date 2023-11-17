/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { ProductsService } from './products.service'
import {
  ProductsController,
  PopularProductsController,
} from './products.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'
import { ProductRepository } from './products.repository'

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController, PopularProductsController],
  providers: [ProductsService, ProductRepository],
})
export class ProductsModule {}

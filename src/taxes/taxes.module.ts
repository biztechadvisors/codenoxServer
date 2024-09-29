/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { TaxesController } from './taxes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tax } from './entities/tax.entity';
import { Product } from 'src/products/entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../helpers/cacheService';

@Module({
  imports: [TypeOrmModule.forFeature([Tax, Product, Category, Shop]),
  CacheModule.register()
  ],
  controllers: [TaxesController],
  providers: [TaxesService, CacheService],
})
export class TaxesModule { }

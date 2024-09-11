/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductsController,
  PopularProductsController,
  UploadProductsXl,
} from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File, OrderProductPivot, Product, Variation, VariationOption } from './entities/product.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Category, SubCategory } from 'src/categories/entities/category.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Type } from 'src/types/entities/type.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Dealer, DealerCategoryMargin, DealerProductMargin } from 'src/users/entities/dealer.entity';
import { User } from 'src/users/entities/user.entity';
import { Tax } from 'src/taxes/entities/tax.entity';
import { UploadXlService } from './uploadProductsXl';
import { CacheModule } from '@nestjs/cache-manager';
import { Region } from '../region/entities/region.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, Region, OrderProductPivot, Variation, VariationOption, Attachment, Category, SubCategory, Shop, Type, Tag, AttributeValue, File, Dealer, DealerProductMargin, DealerCategoryMargin, User, Tax
    ]),
    CacheModule.register(),
  ],
  controllers: [ProductsController, PopularProductsController, UploadProductsXl],
  providers: [
    ProductsService,
    UploadXlService,
  ],
})
export class ProductsModule { }

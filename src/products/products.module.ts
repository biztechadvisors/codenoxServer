import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductsController,
  PopularProductsController,
} from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProductPivot, Product, Variation, VariationOption } from './entities/product.entity';
import { OrderProductPivotRepository, ProductRepository, VariationOptionRepository, VariationRepository } from './products.repository';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentRepository } from 'src/common/common.repository';
import { Category } from 'src/categories/entities/category.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Type } from 'src/types/entities/type.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { CategoryRepository } from 'src/categories/categories.repository';
import { ShopRepository } from 'src/shops/shops.repository';
import { TypeRepository } from 'src/types/types.repository';
import { TagRepository } from 'src/tags/tags.repository';
import { AttributeValueRepository } from 'src/attributes/attribute.repository';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderProductPivot, Variation, VariationOption, Attachment, Category, Shop, Type, Tag, AttributeValue])],
  controllers: [ProductsController, PopularProductsController],
  providers: [ProductsService, ProductRepository, VariationOptionRepository, VariationRepository, OrderProductPivotRepository, AttachmentRepository, CategoryRepository, ShopRepository, TypeRepository, TagRepository, AttributeValueRepository],
})
export class ProductsModule { }
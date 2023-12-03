/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ProductsController,
  // PopularProductsController,
} from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProductPivot, Product, Variation, VariationOption } from './entities/product.entity';
import { OrderProductPivotRepository, ProductRepository, VariationOptionRepository, VariationRepository } from './products.repository';
import { AttributeRepository, AttributeValueRepository } from 'src/attributes/attribute.repository';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Attribute } from 'src/attributes/entities/attribute.entity';
import { AttachmentRepository } from 'src/common/common.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderProductPivot, Variation, VariationOption, AttributeValue, Attribute, AttachmentRepository])],
  controllers: [ProductsController],
  providers: [ProductsService, AttributeValueRepository, AttributeRepository, ProductRepository, VariationOptionRepository, VariationRepository, OrderProductPivotRepository],
})
export class ProductsModule {}

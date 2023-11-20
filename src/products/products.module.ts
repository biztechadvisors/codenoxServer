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

@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderProductPivot, Variation, VariationOption, Attachment])],
  controllers: [ProductsController, PopularProductsController],
  providers: [ProductsService, ProductRepository, VariationOptionRepository, VariationRepository, OrderProductPivotRepository, AttachmentRepository],
})
export class ProductsModule { }
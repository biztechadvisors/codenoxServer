/* eslint-disable prettier/prettier */
import { OmitType } from '@nestjs/swagger';
import { Product, Variation } from '../entities/product.entity';

export class CreateProductDto extends OmitType(Product, [
  'id',
  'slug',
  'created_at',
  'updated_at',
  'orders',
  'pivot',
  'shop',
  'categories',
  'tags',
  'type',
  'related_products',
  'variation_options',
  'translated_languages',
]) {
  categories: number[];
  tags: number[];
  type_id: number;
  shop_id: number;
  variation_options: Variation[];
  related_products: Product[];
}

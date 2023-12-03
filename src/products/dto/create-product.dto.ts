/* eslint-disable prettier/prettier */
import { OmitType } from '@nestjs/swagger';
import { Product, Variation } from '../entities/product.entity';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';

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
  'variations',
  'variation_options',
  'translated_languages',
]) {
  [x: string]: any;
  categories: number[];
  tags: number[];
  type_id: number;
  shop_id: number;
  variations:AttributeValue
  variation_options: Variation[];
  related_products: Product[];
  slug: string;
}


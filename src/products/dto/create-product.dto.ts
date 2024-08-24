/* eslint-disable prettier/prettier */
import { OmitType } from '@nestjs/swagger';
import { Product, Variation } from '../entities/product.entity';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Tax } from 'src/taxes/entities/tax.entity';

export class CreateProductDto extends OmitType(Product, [
  'id',
  'slug',
  'created_at',
  'updated_at',
  'orders',
  'pivot',
  'shop',
  'categories',
  'subCategories',
  'tags',
  'type',
  'related_products',
  'variations',
  'variation_options',
  'translated_languages',
  'taxes',
  'height',
  'length',
  'width',
]) {
  categories: number[];
  subCategories: number[];
  tags: number[];
  type_id: number;
  shop_id: number;
  taxes: Tax;
  variations: AttributeValue[];
  variation_options: {
    [x: string]: any;
    delete: any;
    upsert: VariationDto[];
  } = { delete: [], upsert: [] };
  related_products: Product[];
  translated_languages: string[];
  regionName: string; // Added regionName to DTO
}

export class VariationDto {
  is_digital: boolean;
  sku: string;
  quantity: number;
  sale_price: number;
  price: number;
  is_disable: boolean;
  title: string;
  image: FileDto;
  options: VariationOptionDto[];
  id: any;
}

export class VariationOptionDto {
  id: number;
  name: string;
  value: string;
}

export class FileDto {
  thumbnail: string;
  original: string;
  id: number;
  file_name: string;
}

import { OmitType } from '@nestjs/swagger';
import { File, Product, Variation } from '../entities/product.entity';
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
  categories: number[];
  tags: number[];
  type_id: number;
  shop_id: number;
  variations: AttributeValue[];
  variation_options: { upsert: VariationDto[] };
  related_products: Product[];
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

export class FileDto {
  thumbnail: string;
  original: string;
  id: number;
  file_name: string;
}

export class VariationOptionDto {
  id: number;
  name: string;
  value: string;
}

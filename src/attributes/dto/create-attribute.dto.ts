import { PickType } from '@nestjs/swagger';
import { Attribute } from '../entities/attribute.entity';
import { Shop } from 'src/shops/entities/shop.entity';

export class CreateAttributeDto extends PickType(Attribute, [
  'name',
  'shop_id',
  'slug',
  'language',
]) {
  values: AttributeValueDto[];
  shop: Shop;
}

export class AttributeValueDto {
  id: number;
  value: string;
  meta?: string;
  language?: string;
}
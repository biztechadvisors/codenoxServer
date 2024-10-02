import { PickType } from '@nestjs/swagger';
import { Attribute } from '../entities/attribute.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { IsString, IsOptional } from 'class-validator';

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

export class AttributeResponseDto {
  @IsString()
  id: number;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  shop_id?: number;

  @IsOptional()
  language?: string;

  @IsOptional()
  values?: Array<{ value: string; meta?: any }>; // Adjust according to your needs
}


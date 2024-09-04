/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Category } from '../entities/category.entity'

export class CreateCategoryDto extends PickType(Category, [
  'name',
  'type',
  'details',
  'parent',
  'icon',
  'image',
  'language',
]) {
  shop_id: number;
  type_id: number;
  image_id?: number;
  region_name: string[];
}

export class CreateSubCategoryDto {
  name: string;
  category_id: number;
  details?: string;
  image?: { id: number };
  language: string;
  shop_id: number;
  regionName: string[];  // Ensure this is correctly handled
}




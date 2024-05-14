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
  [x: string]: any;
}

export class CreateSubCategoryDto {
  name: string;
  category_id: number;
  details?: string;
  image: { id: number };
  language: string;
  shop_id: number;
}


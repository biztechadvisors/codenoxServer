import { PickType } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

export class CreateCategoryDto extends PickType(Category, [
  'name',
  'slug',
  'details',
  'parent',
  'icon',
  'image',
  'type',
  'language',
  'translated_languages',
  'products_count',
]) {
  [x: string]: any;
}

/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger';
import { Tag } from '../entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';

export class CreateTagDto extends PickType(Tag, [
  'name',
  'slug',
  'parent',
  'details',
  'icon',
  'type',
  'language',
  'translatedLanguages',
  'shop',
]) {
  [x: string]: any;
  type: Type;
  shop?: Shop;
  image: Attachment;
}

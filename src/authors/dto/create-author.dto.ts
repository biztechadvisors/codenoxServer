/* eslint-disable prettier/prettier */
import { OmitType, PickType } from '@nestjs/swagger'
import { Author } from '../entities/author.entity'

export class CreateAuthorDto extends PickType(Author, [
  'id',
  'bio',
  'born',
  'cover_image',
  'death',
  'image',
  'languages',
  'language',
  'name',
  'products_count',
  'quote',
  'slug',
  'socials',
  'is_approved',
  'translated_languages',
]) {
  shop_id?: string
}

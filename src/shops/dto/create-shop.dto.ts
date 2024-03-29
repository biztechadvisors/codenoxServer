/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Shop } from '../entities/shop.entity'
import { User } from 'src/users/entities/user.entity'

export class CreateShopDto extends PickType(Shop, [
  'name',
  'slug',
  'address',
  'description',
  'cover_image',
  'logo',
  'settings',
  'balance',
  'owner',
]) {
  categories: number[]
  user: User
}

export class ApproveShopDto {
  id: number
  admin_commission_rate: number
}
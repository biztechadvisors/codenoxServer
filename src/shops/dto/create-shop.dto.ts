/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Shop } from '../entities/shop.entity'
import { User } from 'src/users/entities/user.entity'
import { Permission } from '@aws-sdk/client-s3'

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
  'dealerCount'
]) {
  categories: number[];
  permission: Permission;
  additionalPermissions: Permission;
  user: User;
  numberOfDealers?: any;
}

export class ApproveShopDto {
  id: number
  admin_commission_rate: number
}
/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Shop } from '../entities/shop.entity'
import { User } from 'src/users/entities/user.entity'
import { Attachment } from 'src/common/entities/attachment.entity';
import { Permission } from '@db/src/permission/entities/permission.entity';

export class CreateShopDto extends PickType(Shop, [
  'name',
  'slug',
  'address',
  'description',
  'logo',
  'settings',
  'balance',
  'owner',
  'dealerCount',
]) {
  categories: number[];
  permission: Permission;
  additionalPermissions: Permission[];
  cover_image: Attachment[];
  user: User;
}

export class ApproveShopDto {
  id: number
  admin_commission_rate: number
}
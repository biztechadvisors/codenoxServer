/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { User } from '../entities/user.entity';
import { CreateProfileDto } from './create-profile.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';

export enum Permission {
  SUPER_ADMIN = 'Super admin',
  STORE_OWNER = 'Store owner',
  STAFF = 'Staff',
  CUSTOMER = 'Customer',
}
export class CreateUserDto extends PickType(User, [
  'name',
  'email',
  'password',
  'otp',
  'isVerified',
  'is_active',
  'shop_id'
]) {
  address: CreateAddressDto[];
  profile: CreateProfileDto;
  shop: Shop[];
  managed_shop: Shop;
  orders: CreateOrderDto[]
  permission: Permission = Permission.CUSTOMER;
}
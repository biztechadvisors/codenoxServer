/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { User, UserType } from '../entities/user.entity';
import { CreateProfileDto } from './create-profile.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Permission } from 'src/permission/entities/permission.entity';

// enum Permission {
//   SUPER_ADMIN = 'Super admin',
//   STORE_OWNER = 'Store owner',
//   STAFF = 'Staff',
//   CUSTOMER = 'Customer',
//   DEALER = 'Dealer',
// }
export class CreateUserDto extends PickType(User, [
  'name',
  'email',
  'password',
  'otp',
  'isVerified',
  'is_active',
  'refresh_token'
]) {
  address: CreateAddressDto[];
  profile: CreateProfileDto;
  managed_shop: Shop;
  permission: Permission;
  type: Permission;
}
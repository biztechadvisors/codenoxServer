<<<<<<< HEAD
import { PickType } from '@nestjs/swagger';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';
import { User, UserType } from '../entities/user.entity';
import { CreateProfileDto } from './create-profile.dto';
import { Shop } from 'src/shops/entities/shop.entity';
=======
/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto'
import { User } from '../entities/user.entity'
import { CreateProfileDto } from './create-profile.dto'
>>>>>>> 62c223d7ff2bbe988672e7b1af7d7826c0d3e022

enum Permission {
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
  'is_active'
]) {
<<<<<<< HEAD
  address: CreateAddressDto[];
  profile: CreateProfileDto;
  managed_shop: Shop;
  permission: Permission = Permission.CUSTOMER;
  type: UserType;
=======
  address: CreateAddressDto[]
  profile: CreateProfileDto
  permission: Permission = Permission.CUSTOMER
>>>>>>> 62c223d7ff2bbe988672e7b1af7d7826c0d3e022
}

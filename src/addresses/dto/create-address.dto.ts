/* eslint-disable prettier/prettier */
// /* eslint-disable prettier/prettier */
// import { ApiProperty } from '@nestjs/swagger';
// import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
// import { AddressType, UserAddress } from '../entities/address.entity'; // Assuming you have AddressType defined

// export class CreateAddressDto {
//   id: number;
//   title: string;
//   default: boolean;
//   address: {
//     street_address: string;
//     country: string;
//     city: string;
//     state: string;
//     zip: string;
//   };
//   type: AddressType;
//   customer: {
//     id: number
//     name: string
//     email: string
//   };
// }

// export class GetAddressDto {
//   title?: string;
//   type: string;
// }

import { PickType } from '@nestjs/swagger';
import { Address } from '../entities/address.entity';

export class CreateAddressDto extends PickType(Address, [
  'title',
  'type',
  'default',
  'address',
]) {
  'customer_id': number;
}
/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Address } from '../entities/address.entity'

export class CreateAddressDto extends PickType(Address, [
  'title',
  'type',
  'default',
  'address',
]) {
  'customer_id': number
}

export class GetAddressDto {
  title?: string;
  type: string;
}



// import { PickType } from '@nestjs/swagger';
// import { Address } from '../entities/address.entity';

// export class CreateAddressDto extends PickType(Address, [
//   'title',
//   'type',
//   'default',
//   'address',
// ]) {
//   'customer_id': number;
// }

import { PickType } from '@nestjs/swagger';
import { Address, UserAddress } from '../entities/address.entity';

export class CreateAddressDto extends PickType(Address, [
  'title',
  'type',
  'default',
]) {
  'address': UserAddress;
  'customer_id': number;
}
import { PickType } from '@nestjs/swagger';
import { Add, UserAdd } from '../entities/address.entity';

export class CreateAddressDto extends PickType(Add, [
  'title',
  'type',
  'default',
]) {
  'address': UserAdd;
  'customer_id': number;
}
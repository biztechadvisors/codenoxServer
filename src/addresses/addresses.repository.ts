import { Repository } from 'typeorm';
import { Address, UserAddress } from './entities/address.entity';
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator';

@CustomRepository(Address)
export class AddressRepository extends Repository<Address> { }

@CustomRepository(UserAddress)
export class UserAddressRepository extends Repository<UserAddress> { }

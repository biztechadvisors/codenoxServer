import { Repository } from 'typeorm'
import { Address } from './entities/address.entity'
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator'

@CustomRepository(Address)
export class AddressRepository extends Repository<Address> {}

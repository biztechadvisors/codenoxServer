/* eslint-disable prettier/prettier */
import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator'
import { Cart } from './entities/cart.entity'
import { Repository } from 'typeorm'

@CustomRepository(Cart)
export class CartRepository extends Repository<Cart> {}
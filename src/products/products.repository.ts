import { CustomRepository } from 'src/typeorm-ex/typeorm-ex.decorator'
import { Repository } from 'typeorm'
import { Product } from './entities/product.entity'

@CustomRepository(Product)
export class ProductRepository extends Repository<Product> {}

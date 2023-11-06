import { PickType } from '@nestjs/swagger'
import { Wishlist } from '../entities/wishlist.entity'
import { Product } from 'src/products/entities/product.entity'

export class CreateWishlistDto extends PickType(Wishlist, [
  'user_id',
  'product_id',
  'product',
  'created_at',
  'updated_at',
]) {
  user_id: string
  product_id: string
  product: Product
  created_at: Date
  updated_at: Date
}

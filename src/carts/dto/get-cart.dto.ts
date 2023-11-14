/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Cart } from '../entities/cart.entity'

export class GetCartQuantityDto extends PickType(Cart, [
  'customerId',
  'cartData',
  'email',
]) {
  customerId: number
  cartData: string
  email: string
}
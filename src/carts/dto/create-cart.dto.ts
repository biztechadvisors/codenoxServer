/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Cart } from '../entities/cart.entity'

export class CreateCartDto extends PickType(Cart, [
  'customerId',
  'email',
  'phone',
  'cartData',
  'cartQuantity',
]) {
  customerId: number
  email: string
  phone: number
  cartData: string
  cartQuantity: number
}

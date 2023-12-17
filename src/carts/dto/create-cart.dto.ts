/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger'
import { Cart } from '../entities/cart.entity'

export class CreateCartDto extends PickType(Cart, [
  'customerId',
  'email',
  'phone',
  'cartData',
  'cartQuantity',
  'created_at',
  'updated_at',
]) {
  customerId: number
  email: string
  phone: string
  cartData: string
  cartQuantity: number
  created_at: Date
  updated_at: Date
}

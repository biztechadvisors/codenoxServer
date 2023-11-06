/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Cart } from './entities/cart.entity'
import { CreateCartDto } from './dto/create-cart.dto'
import { CartRepository } from './carts.repository'


@Injectable()
export class AbandonedCartService {
  constructor(
    @InjectRepository(CartRepository)
    private cartRepository: CartRepository,
  ) {}

  async create(createCartDto: CreateCartDto, ): Promise<Cart> {
    // const cartItems = createCartDto.cartData.map((item) => item.quantity)
    // const totalQuantity = cartItems.reduce((acc, item) => acc + item, 0)


    // const existingCart = await this.cartRepository.findOne({ where: { 
    //     email: createCartDto.email } })

    // if (existingCart) {
    //   const existingCartData = JSON.parse(existingCart.cartData)
    //   const mergedCartData = mergeCarts(existingCartData, createCartDto.cartData)

    //   await this.cartRepository.update(
    //     { id: existingCart.id },
    //     {
    //       cartData: JSON.stringify(mergedCartData),
    //       cartQuantity: existingCart.cartQuantity + totalQuantity,
    //     },
    //   );
    //   return existingCart;
    // } else {
      const newCart = new Cart()
      newCart.customerId = createCartDto.customerId
      newCart.email = createCartDto.email
      newCart.phone = createCartDto.phone
      newCart.cartData = JSON.stringify(createCartDto.cartData)
      newCart.cartQuantity = createCartDto.cartQuantity

      await this.cartRepository.save(newCart)
      return newCart;
    // }
  }
}

// Helper function to merge two carts
// function mergeCarts(existingCart: any, newCart: any): any {
//   const mergedCart = { ...existingCart }
//   Object.entries(newCart).forEach(([productId, productData]) => {
//     if (!mergedCart[productId]) {
//       mergedCart[productId] = productData
//     } else {
//       mergedCart[productId].quantity += productData.quantity
//     }
//   })
//   return mergedCart
// }

// function mergeCarts(existingCartData: CartData[], newCartData: CartData[]): CartData[] {
//   const mergedCartData = [...existingCartData];

//   for (const newCartItem of newCartData) {
//     const existingCartItem = mergedCartData.find((item) => item.productId === newCartItem.productId);
//     if (existingCartItem) {
//       existingCartItem.quantity += newCartItem.quantity;
//     } else {
//       mergedCartData.push(newCartItem);
//     }
//   }

//   return mergedCartData;
// }

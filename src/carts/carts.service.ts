/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Cart } from './entities/cart.entity'
import { CreateCartDto } from './dto/create-cart.dto'
// import { GetCartQuantityDto } from './dto/get-cart.dto'
import { CartRepository } from './carts.repository'
// import { UpdateCartDto } from './dto/update-cart.dto'


@Injectable()
export class AbandonedCartService {
  constructor(
    @InjectRepository(CartRepository)
    private cartRepository: CartRepository,
  ) {}

  async create(createCartDto: CreateCartDto ): Promise<Cart> {

    const cartItems = JSON.stringify(createCartDto.cartData)
    const cartIT = JSON.parse(cartItems)
    const totalQuantity = cartIT.reduce((acc: any, item: any) => {
    const quantity= item.quantity
        acc += quantity;
          return acc}, 0)

    const existingCart = await this.cartRepository.findOne({ where: { 
        email: createCartDto.email }})

        console.log("first", existingCart.cartQuantity)
        console.log("first", existingCart.cartData)


        if (existingCart) {
console.log("dadta",existingCart)
          // const short = JSON.stringify(existingCart.cartData)
          // console.log("short", short)
          // const existingCartData = JSON.parse(short)
          // console.log("existing", existingCartData)
          //  const carts = JSON.stringify(createCartDto.cartData)
          //  const newCart = JSON.parse(carts)
          const mergedCartData = this.mergeCarts(existingCart.cartData, createCartDto.cartData)
          console.log("mergedDAta", mergedCartData)
          // console.log("mergedDAta", existingCartData)

console.log("createCartDto", createCartDto.cartData)
          await this.cartRepository.update(
            { id: existingCart.id },
            { cartData: JSON.stringify(mergedCartData), cartQuantity: totalQuantity },
          );

      console.log("user exist")
    } else {
      const newCart = new Cart()
      newCart.customerId = createCartDto.customerId
      newCart.email = createCartDto.email
      newCart.phone = createCartDto.phone
      newCart.cartData = JSON.stringify(createCartDto.cartData)
      newCart.cartQuantity = totalQuantity

      await this.cartRepository.save(newCart)
      return newCart
    }

    return existingCart
  }


// Helper function to merge two carts
async mergeCarts(existingCart, newCart): Promise<Cart> {
  const mergedCart = { ...existingCart }
  Object.entries(newCart).forEach(([productId, cartData]) => {
    if (!mergedCart[productId]) {
      mergedCart[productId] = cartData
    } else {
      const cart = JSON.stringify(existingCart.cartData)
      console.log("cart", cart)
      const cartData = JSON.parse(cart)
      console.log("cartData", cartData)
      // Sum up the quantity of all products in the cart
      mergedCart[productId].quantity += cartData.quantity
    }
  })
  return mergedCart
}
}
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


          // Get the cart quantity from the existing cart data
      //     const existingCartQuantity = await this.getCartQuantity(existingCart)
      // console.log("existingcartQuantity", existingCartQuantity)
      //     // Sum up the existing cart quantity and the new cart quantity
      //     const newCartQuantity = existingCart.cartQuantity + existingCartQuantity
      // console.log("newCartQuantity", newCartQuantity)
      //     // Update the cart quantity in the existing cart data
      //     existingCart.cartQuantity = newCartQuantity
      
      //     // Save the existing cart data
      //     await this.cartRepository.save(existingCart)


      // Get the cart quantity from the existing cart data
// async getCartQuantity(existingCart: GetCartQuantityDto): Promise<number> {
//   // Get the cart data from the existing cart
//   const cart = JSON.stringify(existingCart.cartData)
//   console.log("cart", cart)
//   const cartData = JSON.parse(cart)
//   console.log("cartData", cartData)
//   // Sum up the quantity of all products in the cart
//   const cartQuantity = cartData.reduce((totalQuantity: number, product: { quantity: number }) => {
//     return totalQuantity + product.quantity
//   }, 0)
// console.log("cartQuantity", cartQuantity)
//   return cartQuantity
// }
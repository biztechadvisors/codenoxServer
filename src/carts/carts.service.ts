/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Cart } from './entities/cart.entity'
import { CreateCartDto } from './dto/create-cart.dto'
// import { GetCartQuantityDto } from './dto/get-cart.dto'
import { CartRepository } from './carts.repository'
import { GetCartData } from './dto/get-cart.dto'
// import { DeleteCartDto } from './dto/delete-cart.dto'
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


        if (existingCart) {
         console.log("dadta",existingCart)
          // const short = JSON.stringify(existingCart.cartData)
          // console.log("short", short)
          // const existingCartData = JSON.parse(short)
          // console.log("existing", existingCartData)
          //  const carts = JSON.stringify(createCartDto.cartData)
          //  const newCart = JSON.parse(carts)
          // const mergedCartData = this.mergeCarts(existingCart.cartData, createCartDto.cartData)
          // console.log("mergedDAta", mergedCartData)
          // console.log("mergedDAta", existingCartData)
          // const tryy = JSON.stringify(mergedCartData)
          // console.log("tryy", tryy)
          // console.log("createCartDto", createCartDto.cartData)
          // const Data = JSON.stringify(createCartDto.cartData)
          await this.cartRepository.update(
            { id: existingCart.id },
            { cartData: JSON.stringify(createCartDto.cartData), cartQuantity: totalQuantity },
           
          );

      console.log("user exist")
    } else {
      const newCart = new Cart()
      newCart.customerId = createCartDto.customerId
      newCart.email = createCartDto.email
      newCart.phone = createCartDto.phone
      newCart.cartData = JSON.stringify(createCartDto.cartData)
      newCart.cartQuantity = totalQuantity
      newCart.created_at = createCartDto.created_at
      newCart.updated_at = createCartDto.updated_at

      await this.cartRepository.save(newCart)
      return newCart
    }

    return existingCart
  }

  async getCartData(param: GetCartData): Promise<{ products: any[]; totalCount: number }> {
    const existingCart = await this.cartRepository.findOne({ where: { customerId: param.customerId, email: param.email } });
    console.log("id", param.customerId, param.email)
    console.log("cart", existingCart)
    if (!existingCart) {
      console.log("empty")
      return { products: [], totalCount: 0 };
    }

    let existingCartData = {};
    try {
       const exist = JSON.stringify(existingCart.cartData)
      existingCartData = JSON.parse(exist);
      console.log("CartData")
    } catch (err) {
      console.error(`Error parsing cart data: ${err.message}`);
      return { products: [], totalCount: 0 };
    }

    const products = [];
    let totalCount = 0;

    for (const key in existingCartData) {
      const product = existingCartData[key];
      products.push(product);
      totalCount += product.quantity;
    }

    return { products, totalCount };
  }


  async delete(productId: number, query: any): Promise<any> {
    console.log("productId", productId)
    // console.log("query", query.quantity)
    const existingCart = await this.cartRepository.findOne({ where: { email: query.email } });

    // console.log("email", existingCart, productId, query.quantity, query.email)
    if (!existingCart) {
      return { error: 'Cart not found for the provided email' }; // Handle non-existent cart
    }
  
    const quantity = query.quantity;
    let existingCartData: any = {};
    try {
      const get = JSON.stringify(existingCart.cartData);
      existingCartData = JSON.parse(get);
      
      // console.log("data", existingCartData)
    } catch (err) {
      console.error(`Error parsing cart data: ${err.message}`);
      return null; // Handle error parsing cart data
    }
  
    let itemRemoved = false;
    let cartQuantity = existingCart.cartQuantity;
    console.log("existingItem", existingCartData)


    // for (const productId in existingCartData) {
    //   const productData = existingCartData[productId];
    //   // Access and process productData here
    //   console.log(`Product ID: ${productId}`);
    //   console.log(`Product Data: ${JSON.stringify(productData)}`);
      
    //   return productData
      
    // }

    for (let i = 0; i < quantity; i++) {

      console.log("first", productId, existingCartData[0].productId)
      if (existingCartData[productId]) {
        console.log("carts", existingCartData[productId])
        // console.log("set",existingCartData[productId])
        if (existingCartData[productId].quantity > 1) {
        existingCartData[productId].quantity -= 1;
          cartQuantity -= 1;
        } else {
         this.cartRepository.delete(existingCartData[productId]);
          cartQuantity -= 1;
          console.log("Item deleted successfully")
        }
        itemRemoved = true;
      }
    }
  
    if (!itemRemoved) {
      return { error: 'Item not found in cart' }; // Handle item not found
    }
  
    await this.cartRepository.update({ email: query.email }, {
      cartData: JSON.stringify(existingCartData),
      cartQuantity: cartQuantity,
    });
  
    return { updatedCart: existingCartData }; // Return updated cart data
  }
  
  





// Helper function to merge two carts
async mergeCarts(existingCart, newCart): Promise<Cart> {
  console.log("existing&meregcart", existingCart, newCart)
  const mergedCart = { ...existingCart }
  Object.entries(newCart).forEach(([productId, cartData]) => {
    if (!mergedCart[productId]) {
      mergedCart[productId] = cartData
      console.log("cartDataaaaa", cartData)
    } else {
      const cart = JSON.stringify(existingCart.cartData)
      console.log("cart", cart)
      const cartData = JSON.parse(cart)
      console.log("cartData", cartData)
      // mergedCart.push(newCart)
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
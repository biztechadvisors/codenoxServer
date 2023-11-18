/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common'
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

  // -------------------------------CREATE CART------------------------------------------------

  async create(createCartDto: CreateCartDto ): Promise<Cart> {

    const cartItems = Object.values(createCartDto.cartData)
    const totalQuantity = cartItems.reduce((acc: any, item: any) => {
    const quantity= item.quantity
        acc += quantity;
          return acc}, 0)

    const existingCart = await this.cartRepository.findOne({ where: { 
        email: createCartDto.email }})


        if (existingCart) {
         console.log("dadta",existingCart)

          await this.cartRepository.update(
            { id: existingCart.id },
            { cartData: JSON.stringify(createCartDto.cartData), 
              cartQuantity: totalQuantity },
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

  // ---------------------------------GET CART-----------------------------------------------------------

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


  // -----------------------------------DELETE----------------------------------------------------

  async delete(itemId: string, query?: any): Promise<any> {
    const itemsId = parseInt(itemId)


    const existingCart = await this.cartRepository.findOne({ where: { email: query.email } });

    if (!existingCart) {
      return { error: 'Cart not found for the provided email' }; // Handle non-existent cart
    }
  
    const quantity = query.quantity; 
    let existingCartData: any = {};

    try {
  
      if (typeof existingCart.cartData === 'object') {
        existingCartData = existingCart.cartData;
      } else {
        existingCartData = JSON.parse(existingCart.cartData);
      }
      
    } catch (err) {
      console.error(`Error parsing cart data: ${err.message}`);
      return null; // Handle error parsing cart data
    }
  
    let itemRemoved = false;
    let cartQuantity = existingCart.cartQuantity;

    if(quantity){
      for(let i=0; i < quantity; i++) {

          if (existingCartData[itemsId]) {
            if (existingCartData[itemsId].quantity > 1) {
              existingCartData[itemsId].quantity -= 1;
              cartQuantity -= 1;
              console.log("cartQuantity", cartQuantity)
            } else {
              delete existingCartData[itemsId];
              cartQuantity -= 1;
            }
            itemRemoved = true;
          }
        }
       }


       if (!quantity) {
        if (existingCartData[itemsId]) {
          if (existingCartData[itemsId].quantity > 1) {
            existingCartData[itemsId].quantity -= 1;
            cartQuantity -= 1;
            // console.log("Quantity", quantity)
          } else {
            delete existingCartData[itemsId];
            cartQuantity -= 1;
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
  
// -----------------------------------------CLREA CART -------------------------------------------------

  async clearCart(email: string): Promise<string> {
    const updatedRows = await this.cartRepository.update(
      { email: email },
      { cartData: "{}", cartQuantity: null },
    );

    if (updatedRows.affected > 0) {
      return 'Cart cleared successfully';
    } else {
      throw new NotFoundException('Cart not found');
    }
  }
  
// ----------------------------ABANDONED CART REMINDER------------------------------------




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
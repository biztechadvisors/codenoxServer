/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Cart } from './entities/cart.entity'
import { CreateCartDto } from './dto/create-cart.dto'
import { CartRepository } from './carts.repository'
import { GetCartData } from './dto/get-cart.dto'
import { Interval } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { MailService } from 'src/mail/mail.service'


@Injectable()
export class AbandonedCartService {
 
  constructor(
    // private readonly scheduler: ScheduleModule,
    @InjectRepository(CartRepository)
    private cartRepository: CartRepository,
    private mailService: MailService,
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

          await this.cartRepository.update(
            { id: existingCart.id },
            { cartData: JSON.stringify(createCartDto.cartData), 
              cartQuantity: totalQuantity },
          );

    } else {
      const newCart = new Cart()
      newCart.customerId = createCartDto.customerId
      newCart.email = createCartDto.email
      newCart.phone = createCartDto.phone
      newCart.cartData = JSON.stringify(createCartDto.cartData)
      newCart.cartQuantity = totalQuantity
      newCart.created_at = new Date()
      newCart.updated_at = new Date()


      await this.cartRepository.save(newCart)
      return newCart
    }

    return existingCart
  }

  // ---------------------------------GET CART-----------------------------------------------------------

  async getCartData(param: GetCartData): Promise<{ products: any[]; totalCount: number }> {
    const existingCart = await this.cartRepository.findOne({ where: { customerId: param.customerId, email: param.email } });

    if (!existingCart) {

      return { products: [], totalCount: 0 };
    }

    let existingCartData = {};
    try {
       const exist = JSON.stringify(existingCart.cartData)
      existingCartData = JSON.parse(exist);

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

// @Interval(600000)
async sendAbandonedCartReminder() {
  // console.log("@working@")
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const abandonedCartData = await this.cartRepository.find({
      where: {
        updated_at: LessThan(twentyFourHoursAgo),
       
      },
    });

    // console.log("@working@", abandonedCartData)

    for (const cart of abandonedCartData) {
  console.log("@working fine for cart data", cart)
   
      try {
        const pro = JSON.stringify(cart.cartData)
        const products = JSON.parse(pro);
        const email = cart.email;  
  // console.log("r#tr============", pro, products)

        await this.mailService.sendAbandonmenCartReminder(email, products);
   
      } catch (error) {
        console.log("erroor___________", error)
      }
    }  
  } catch (error) {
    console.log('Failed to send abandoned cart reminder emails');
  }
}
}

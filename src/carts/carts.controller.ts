/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Delete, Param, Query, Get, UsePipes,ValidationPipe, Put } from '@nestjs/common';
import { AbandonedCartService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { GetCartData } from './dto/get-cart.dto';
import { ClearCartDto } from './dto/delete-cart.dto';
// import { Cart } from './entities/cart.entity';



@Controller('carts')
export class AbandonedCartController {
  constructor(private readonly abandonedCartService: AbandonedCartService) {}

  @Post()
  async create(@Body() createCartDto: CreateCartDto)
  // : Promise<{ message: string; status: boolean }> 
  {
   const data = await this.abandonedCartService.create(createCartDto)
    return data
    //  { message: 'cart inserted successfully', status: true}
  }


  @Get(':id/:email')
  async getAbandonedCartCount(
    @Param() param: GetCartData,
  ){
      const retrive = await this.abandonedCartService.getCartData(param);

      return retrive;
  }
  // { message: string; status: boolean; }
  // { message: 'Data retrive successfully', status: true }

  @Delete(':itemId/:quantity/:email')
  async removeProductFromCart(
  //  @Param('id') id: number,
   @Param('itemId') itemId: string,
   @Query() query: { quantity?: number, email?: string  },
  ): Promise<{ message: string; status: boolean; }> {
    return await this.abandonedCartService.delete(itemId, query); 
      //  { message: 'cart deleted successfully', status: true}
  }

  @Put(':clearCart')
  @UsePipes(new ValidationPipe({ transform: true }))
  async clearCart(@Query() clearCartDto: ClearCartDto) {
    const message = await this.abandonedCartService.clearCart(clearCartDto.email);
    return { success: true, message: message };
  }
  
}

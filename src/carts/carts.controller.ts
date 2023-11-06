/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AbandonedCartService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
// import { Cart } from './entities/cart.entity';



@Controller('carts')
export class AbandonedCartController {
  constructor(private readonly abandonedCartService: AbandonedCartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.abandonedCartService.create(createCartDto)
  }

}



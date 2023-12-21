/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
<<<<<<< HEAD
} from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { GetPaymentMethodsDto } from './dto/get-payment-methods.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodService } from './payment-method.service';
import { User } from 'src/users/entities/user.entity';
=======
} from '@nestjs/common'
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto'
import { GetPaymentMethodsDto } from './dto/get-payment-methods.dto'
import { DefaultCart } from './dto/set-default-card.dto'
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto'
import { PaymentMethodService } from './payment-method.service'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

@Controller('cards')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }

  @Post()
<<<<<<< HEAD
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto, user: User) {
    return this.paymentMethodService.create(createPaymentMethodDto, user);
=======
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(createPaymentMethodDto)
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  }

  @Get()
  findAll(@Query() getTaxesDto: GetPaymentMethodsDto) {
    return this.paymentMethodService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentMethodService.findOne(+id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaxDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodService.update(+id, updateTaxDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentMethodService.remove(+id)
  }
}

@Controller('/save-payment-method')
export class SavePaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }
  @Post()
<<<<<<< HEAD
  savePaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto, user: User) {
    createPaymentMethodDto.default_card = false;
    return this.paymentMethodService.savePaymentMethod(createPaymentMethodDto, user);
=======
  savePaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    createPaymentMethodDto.default_card = false
    return this.paymentMethodService.savePaymentMethod(createPaymentMethodDto)
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  }
}

@Controller('/set-default-card')
export class SetDefaultCartController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }
  @Post()
  setDefaultCart(@Body() defaultCart: DefaultCart) {
    return this.paymentMethodService.saveDefaultCart(defaultCart)
  }
}

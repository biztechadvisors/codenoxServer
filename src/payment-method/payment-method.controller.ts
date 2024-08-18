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
} from '@nestjs/common';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { GetPaymentMethodsDto } from './dto/get-payment-methods.dto';
import { DefaultCart } from './dto/set-default-card.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethodService } from './payment-method.service';
import { User } from 'src/users/entities/user.entity';
import { PaymentMethod } from './entities/payment-method.entity';

@Controller('cards')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }

  @Post()
  async create(@Body() createPaymentMethodDto: CreatePaymentMethodDto, @Body() user: User) {
    return this.paymentMethodService.create(createPaymentMethodDto, user);
  }

  @Get()
  async findAll(@Query() query: GetPaymentMethodsDto): Promise<PaymentMethod[]> {
    return this.paymentMethodService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentMethodService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodService.update(+id, updatePaymentMethodDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.paymentMethodService.remove(+id);
  }
}

@Controller('/save-payment-method')
export class SavePaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }

  @Post()
  async savePaymentMethod(@Body() createPaymentMethodDto: CreatePaymentMethodDto, @Body() user: User) {
    createPaymentMethodDto.default_card = false;
    return this.paymentMethodService.savePaymentMethod(createPaymentMethodDto, user);
  }
}

@Controller('/set-default-card')
export class SetDefaultCardController {
  constructor(private readonly paymentMethodService: PaymentMethodService) { }

  @Post()
  async setDefaultCard(@Body() defaultCart: DefaultCart) {
    return this.paymentMethodService.saveDefaultCart(defaultCart);
  }
}

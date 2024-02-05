/* eslint-disable prettier/prettier */
import settingsJson from '@db/settings.json'
import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { Setting } from 'src/settings/entities/setting.entity'
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto'
import { PaymentIntentService } from './payment-intent.service'

const settings = plainToClass(Setting, settingsJson)

@Controller('payment-intent')
export class PaymentIntentController {
  constructor(private readonly paymentIntentService: PaymentIntentService) { }

  @Get()
  async getPaymentIntent(@Query() query: GetPaymentIntentDto) {

    return this.paymentIntentService.getPaymentIntent(query)
  }

  @Post('save-paymentId')
  async savePaymentIdIntent(@Body() razorpayData: any): Promise<any> {
 
    return await this.paymentIntentService.savePaymentIdIntent(razorpayData);
  }

}

/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntentService } from './payment-intent.service';

@Controller('payment-intent')
export class PaymentIntentController {
  constructor(private readonly paymentIntentService: PaymentIntentService) { }

  @Get()
  async getPaymentIntent(@Query() query: GetPaymentIntentDto) {
    return this.paymentIntentService.getPaymentIntent(query);
  }

  @Post('save-paymentId')
  async savePaymentIdIntent(@Body() razorpayData: { razorpay_order_id: string; razorpay_payment_id: string }): Promise<any> {
    return this.paymentIntentService.savePaymentIdIntent(razorpayData);
  }
}

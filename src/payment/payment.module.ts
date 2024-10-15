import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './paypal-payment.service';
import { StripePaymentService } from './stripe-payment.service';
import { RazorpayService } from './razorpay-payment.service';
import { Card, Payment } from './entity/razorpay.entity';
import { OrderProductPivot } from '../products/entities/product.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Card, Payment, OrderProductPivot]),
  ],
  providers: [
    StripePaymentService,
    PaypalPaymentService,
    RazorpayService,
  ],
  exports: [
    StripePaymentService,
    PaypalPaymentService,
    RazorpayService,
  ],
})
export class PaymentModule { }

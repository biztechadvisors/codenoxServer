import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './paypal-payment.service';
import { StripePaymentService } from './stripe-payment.service';
import { UserRepository } from 'src/users/users.repository';
import { RazorpayService } from './razorpay-payment.service';
import { Card, Payment } from './entity/razorpay.entity';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { OrderProductPivotRepository } from 'src/products/products.repository';

@Module({
  imports: [
    AuthModule,
    TypeOrmExModule.forCustomRepository([
      OrderProductPivotRepository
    ]),
    TypeOrmModule.forFeature([Card, Payment]),
  ],
  providers: [
    StripePaymentService,
    PaypalPaymentService,
    RazorpayService,
    UserRepository
  ],
  exports: [
    StripePaymentService,
    PaypalPaymentService,
    RazorpayService
  ],
})
export class PaymentModule { }

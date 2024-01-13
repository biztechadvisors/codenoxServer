/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PaypalPaymentService } from './paypal-payment.service'
import { StripePaymentService } from './stripe-payment.service'
import { UserRepository } from 'src/users/users.repository'
import { RazorpayService } from './razorpay-payment.service'
// import { RazorpayService } from './razorpay.service'

@Module({
  imports: [AuthModule],
  providers: [StripePaymentService, PaypalPaymentService,
    RazorpayService,
    UserRepository],
  exports: [StripePaymentService, PaypalPaymentService,
    RazorpayService
  ],
})
export class PaymentModule { }

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { PaypalPaymentService } from './paypal-payment.service'
import { StripePaymentService } from './stripe-payment.service'
import { UserRepository } from 'src/users/users.repository'

@Module({
  imports: [AuthModule],
  providers: [StripePaymentService, PaypalPaymentService, UserRepository],
  exports: [StripePaymentService, PaypalPaymentService],
})
export class PaymentModule { }

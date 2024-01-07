/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './paypal-payment.service';
import { StripePaymentService } from './stripe-payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceSettings, Metadata, StripeCustomer, StripeCustomerList, StripePaymentIntent, StripePaymentMethod } from './entity/stripe.entity';
import { Setting } from 'src/settings/entities/setting.entity';
import { PaymentMethod } from 'src/payment-method/entities/payment-method.entity';

@Module({
  imports: [AuthModule,TypeOrmModule.forFeature([StripeCustomer,StripeCustomerList,StripePaymentMethod,StripePaymentIntent,Setting,PaymentMethod,InvoiceSettings,Metadata])],
  providers: [StripePaymentService, PaypalPaymentService],
  exports: [StripePaymentService, PaypalPaymentService],
})
export class PaymentModule {}

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import { SettingsModule } from 'src/settings/settings.module';
import {
  PaymentMethodController,
  SavePaymentMethodController,
  SetDefaultCardController,
} from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentGateWay } from './entities/payment-gateway.entity';

@Module({
  imports: [
    AuthModule,
    PaymentModule,
    SettingsModule,
    TypeOrmModule.forFeature([PaymentMethod, PaymentGateWay]),
  ],
  controllers: [
    PaymentMethodController,
    SavePaymentMethodController,
    SetDefaultCardController,
  ],
  providers: [PaymentMethodService],
})
export class PaymentMethodModule { }

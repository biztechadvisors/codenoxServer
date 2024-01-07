/* eslint-disable prettier/prettier */
import { OmitType, PickType } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment-method.entity';
// import { PaymentGateway } from 'src/settings/entities/setting.entity';
import { PaymentGateWay } from '../entities/payment-gateway.entity';
// import { Card } from 'src/payment/entity/stripe.entity';

export class CreatePaymentMethodDto extends PickType(PaymentMethod, [
  'method_key',
  'default_card',
  'payment_gateway_id',
  'fingerprint',
  'owner_name',
  'network',
  'type',
  'last4',
  'expires',
  'origin',
  'verification_check',
  'created_at',
  'updated_at',
]) {
  payment_gateways?: PaymentGateWay;
  // cards?:Card
}

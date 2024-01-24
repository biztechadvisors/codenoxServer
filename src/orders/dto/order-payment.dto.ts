/* eslint-disable prettier/prettier */
import { PaymentIntentInfo } from "src/payment-intent/entries/payment-intent.entity"

export class OrderPaymentDto {
  tracking_number: number
  paymentIntentInfo: PaymentIntentInfo
}

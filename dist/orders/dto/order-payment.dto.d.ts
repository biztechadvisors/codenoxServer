import { PaymentIntentInfo } from "src/payment-intent/entries/payment-intent.entity";
export declare class OrderPaymentDto {
    tracking_number: number;
    paymentIntentInfo: PaymentIntentInfo;
}

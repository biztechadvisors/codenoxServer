import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntentService } from './payment-intent.service';
export declare class PaymentIntentController {
    private readonly paymentIntentService;
    constructor(paymentIntentService: PaymentIntentService);
    getPaymentIntent(query: GetPaymentIntentDto): Promise<import("./entries/payment-intent.entity").PaymentIntent>;
    savePaymentIdIntent(razorpayData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
    }): Promise<any>;
}

import { Repository } from 'typeorm';
import { GetPaymentIntentDto } from './dto/get-payment-intent.dto';
import { PaymentIntent, PaymentIntentInfo } from './entries/payment-intent.entity';
export declare class PaymentIntentService {
    private paymentIntentRepository;
    private paymentIntentInfoRepository;
    constructor(paymentIntentRepository: Repository<PaymentIntent>, paymentIntentInfoRepository: Repository<PaymentIntentInfo>);
    getPaymentIntent(getPaymentIntentDto: GetPaymentIntentDto): Promise<PaymentIntent>;
    savePaymentIdIntent(razorpayData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
    }): Promise<PaymentIntentInfo>;
}

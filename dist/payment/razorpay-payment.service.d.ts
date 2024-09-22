import { Order } from 'src/orders/entities/order.entity';
import { Card, Payment } from './entity/razorpay.entity';
import { Repository } from 'typeorm';
export declare class RazorpayService {
    private paymentRepository;
    private cardRepository;
    private razorpay;
    private key_secret;
    constructor(paymentRepository: Repository<Payment>, cardRepository: Repository<Card>);
    createPaymentIntent(order: Order): Promise<{
        client_secret: any;
        redirect_url: any;
        id: any;
    }>;
    verifyOrder(razorpay_payment_id: string): Promise<{
        payment: any;
    }>;
    saveRazorPayRes(payment: any): Promise<boolean>;
}

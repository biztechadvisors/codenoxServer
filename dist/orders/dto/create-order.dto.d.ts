import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { PaymentGatewayType } from '../entities/order.entity';
export declare class UserAddressInput {
    id: number;
    street_address: string;
    country: string;
    city: string;
    state: string;
    zip: string;
}
export declare class ConnectProductOrderPivot {
    product_id: number;
    variation_option_id?: number;
    order_quantity: number;
    unit_price: number;
    subtotal: number;
    quantity: any;
}
export declare class CardInput {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    email?: string;
}
export declare class CreateOrderDto {
    soldByUserAddress?: UserAddressInput;
    shop_id?: number;
    coupon_id?: number;
    status: string;
    customerId?: number;
    customer_contact: string;
    products: ConnectProductOrderPivot[];
    amount: number;
    sales_tax: number;
    total?: number;
    paid_total?: number;
    payment_id?: string;
    payment_gateway: PaymentGatewayType;
    discount?: number;
    delivery_fee?: number;
    delivery_time: string;
    card?: CardInput;
    billing_address?: UserAddressInput;
    shipping_address?: UserAddressInput;
    payment_intent?: PaymentIntent;
    language?: string;
    translated_languages?: string[];
    dealerId?: number;
}

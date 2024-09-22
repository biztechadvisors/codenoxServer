import { CardInput, ConnectProductOrderPivot, UserAddressInput } from 'src/orders/dto/create-order.dto';
import { PaymentGatewayType } from 'src/orders/entities/order.entity';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
export declare class CreateStocksDto {
    products: any[];
    ordPendQuant: number;
    orderedQuantity: number;
    receivedQuantity: number;
    dispatchedQuantity: number;
    quantity: number;
    user_id: number;
    order_id: number;
}
export declare class GetStocksDto {
    products: Product[];
    quantity: number;
    ordPendQuant: number;
    receivedQuantity: number;
    dispatchedQuantity: number;
    user_id: number;
    order_id: number;
}
export declare class UpdateStkQuantityDto {
    order_id: number;
    product_id: number;
    updateDispatchQuant: number;
}
export declare class UpdateInvStkQuantityDto {
    order_id: number;
    product_id: number;
    updateReceivedQuantity: number;
}
export declare class CreatestockOrderDto {
    soldByUserAddress?: UserAddressInput;
    soldBy?: User;
    coupon_id?: number;
    status: string;
    customer_contact: string;
    products: ConnectProductOrderPivot[];
    amount: number;
    sales_tax: number;
    total?: number;
    paid_total?: number;
    payment_id?: string;
    payment_gateway?: PaymentGatewayType;
    discount?: number;
    delivery_fee?: number;
    delivery_time: string;
    card?: CardInput;
    billing_address?: UserAddressInput;
    shipping_address?: UserAddressInput;
    payment_intent: PaymentIntent;
    language?: string;
    dealerId?: User;
}

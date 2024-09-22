export declare class PaymentIntentInfo {
    id: number;
    client_secret?: string | null;
    redirect_url?: string | null;
    payment_id: string;
    order_id: string;
    is_redirect: boolean;
}
export declare class PaymentIntent {
    id: number;
    order_id: number;
    tracking_number: string;
    payment_gateway: string;
    payment_intent_info?: PaymentIntentInfo;
}

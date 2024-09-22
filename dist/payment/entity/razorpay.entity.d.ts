export declare class Card {
    id: number;
    razorPay_id: string;
    last4: string;
    network: string;
    type: string;
}
export declare class Payment {
    id: number;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    international: boolean;
    method: string;
    amount_refunded: number;
    captured: boolean;
    description: string;
    card: Card;
    email: string;
    contact: string;
    notes: object;
    fee: number;
    tax: number;
    error_code: string;
    error_description: string;
    error_source: string;
    error_step: string;
    error_reason: string;
    acquirer_data: object;
    created_at: Date;
}

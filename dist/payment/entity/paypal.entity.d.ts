export declare class Name {
    id: number;
    given_name: string;
    surname: string;
}
export declare class Address {
    id: number;
    country_code: string;
}
export declare class Paypal {
    id: number;
    email_address: string;
    account_id: string;
    name: Name;
    address: Address;
}
export declare class PaymentSource {
    id: number;
    paypal: Paypal;
}
export declare class PaypalOrderResponse {
    id: string;
    status: string;
    payment_source: PaymentSource;
    links: Link[];
}
export declare class Link {
    id: number;
    href: string;
    rel: string;
    method: string;
}
export declare class AccessToken {
    id: number;
    scope: string;
    access_token: string;
    token_type: string;
    app_id: string;
    expires_in: number;
    nonce: string;
}
export declare class Link2 {
    id: number;
    href: string;
    rel: string;
    method: string;
}
export declare class Payer {
    id: number;
    name: Name;
    email_address: string;
    payer_id: string;
    address: Address;
}
export declare class PaypalCaptureOrderResponse {
    id: string;
    status: string;
    payment_source: PaymentSource;
    purchase_units: PurchaseUnit[];
    payer: Payer;
    links: Link2[];
}
export declare class Name2 {
    id: number;
    full_name: string;
}
export declare class Address2 {
    id: number;
    address_line_1: string;
    admin_area_2: string;
    admin_area_1: string;
    postal_code: string;
    country_code: string;
}
export declare class Shipping {
    id: number;
    name: Name2;
    address: Address2;
}
export declare class Payments {
    id: number;
    captures: Capture[];
}
export declare class PurchaseUnit {
    id: number;
    reference_id: string;
    shipping: Shipping;
    payments: Payments;
}
export declare class Amount {
    id: number;
    currency_code: string;
    value: string;
}
export declare class SellerProtection {
    id: number;
    status: string;
    dispute_categories: string[];
}
export declare class GrossAmount {
    id: number;
    currency_code: string;
    value: number;
}
export declare class PaypalFee {
    id: number;
    currency_code: string;
    value: number;
}
export declare class NetAmount {
    id: number;
    currency_code: string;
    value: number;
}
export declare class SellerReceivableBreakdown {
    id: number;
    gross_amount: GrossAmount;
    paypal_fee: PaypalFee;
    net_amount: NetAmount;
}
export declare class Capture {
    id: string;
    status: string;
    amount: Amount;
    final_capture: boolean;
    seller_protection: SellerProtection;
    seller_receivable_breakdown: SellerReceivableBreakdown;
    links: Link[];
    create_time: string;
    update_time: string;
}

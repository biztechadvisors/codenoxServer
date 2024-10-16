import { Add } from '@db/src/address/entities/address.entity';
export declare class Metadata {
    id: number;
    order_tracking_number: number;
}
export declare class BillingDetails {
    id: number;
    address: Add;
    email: string;
    name: string;
    phone: string;
}
export declare class Card {
    [x: string]: any;
    id: number;
    brand: string;
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    last4: string;
}
export declare class InvoiceSettings {
    id: number;
    custom_fields?: string;
    default_payment_method?: string;
    footer?: string;
    rendering_options?: string;
}
export declare class StripeCustomer {
    id: number;
    object: string;
    address: Add;
    balance?: number;
    created?: number;
    currency?: string;
    default_source?: string;
    delinquent?: boolean;
    description?: string;
    discount?: string;
    email?: string;
    invoice_prefix?: string;
    invoice_settings?: InvoiceSettings;
    livemode?: boolean;
    metadata?: Metadata;
    name?: string;
    next_invoice_sequence?: number;
    phone?: string;
    tax_exempt?: string;
}
export declare class StripePaymentMethod {
    id: number;
    object: string;
    billing_details: BillingDetails;
    card: Card;
    created: number;
    customer: string;
    livemode: boolean;
    metadata: Metadata;
    type: string;
}
export declare class PaymentIntentMetadata {
    id: number;
    order_tracking_number: number;
}
export declare class StripePaymentIntent {
    id: number;
    amount: number;
    amount_received: number;
    client_secret: string;
    currency: string;
    customer: string;
    metadata: PaymentIntentMetadata;
    payment_method_types: string[];
    setup_future_usage: string;
    status: string;
}

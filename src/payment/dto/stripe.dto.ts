/* eslint-disable prettier/prettier */
import {  InvoiceSettings,  PaymentIntentMetadata, StripeCustomer } from "../entity/stripe.entity";

export class Metadata {
  id?: number;
  order_tracking_number?: string;
}

export class StripeCreateCustomerListDto{
  object?: string;
  url?: string;
  has_more?:boolean
  data?: StripeCustomer[]
}

export class StripeCreateCustomerDto {
  object?: string;
  address?: AddressStripe;
  balance?: number;
  created?: number;
  currency?: string;
  default_source?: any;
  delinquent?: boolean;
  discount?: any;
  description?: string;
  name?: any;
  email?: string;
  invoice_prefix?: string;
  invoice_settings?: InvoiceSettings[];
  livemode?: boolean;
  metadata?: Metadata;
  next_invoice_sequence?: number;
  phone?: any;
  preferred_locales?: any[];
  shipping?: any;
  tax_exempt?: string;
  test_clock?: any;
}

export class AddressStripe {
  id?: number;
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  postal_code?: string;
  state?: string;
}

export class CardElementDto {
  id:number;
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
}

export class CreatePaymentIntentDto {
  customer: any;
  amount: number;
  currency: string;
  payment_method_types: string[];
  metadata?: 
  {
    order_tracking_number: string; // Ensure the correct type
  };
  // Other properties...
}


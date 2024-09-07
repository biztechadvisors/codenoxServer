/* eslint-disable prettier/prettier */
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity'
import { PaymentGatewayType } from '../entities/order.entity'
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class UserAddressInput {
  id: number;
  street_address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
}

export class ConnectProductOrderPivot {
  product_id: number;
  variation_option_id?: number;
  order_quantity: number;
  unit_price: number;
  subtotal: number;
  quantity: any;
}

export class CardInput {
  number: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  email?: string
}

export class CreateOrderDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  soldByUserAddress?: UserAddressInput;

  @IsOptional()
  @IsNumber()
  shop_id?: number;  // Shop ID instead of the Shop entity for simplicity

  @IsOptional()
  @IsNumber()
  coupon_id?: number;  // Coupon ID if applicable

  @IsString()
  @IsNotEmpty()
  status: string;  // Order status (could be 'pending', 'completed', etc.)

  @IsOptional()
  @IsNumber()
  customerId?: number;  // Registered customer ID if the user is logged in

  @IsString()
  @IsNotEmpty()
  customer_contact: string;  // Contact info for both guests and logged-in users

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectProductOrderPivot)
  products: ConnectProductOrderPivot[];  // Order products

  @IsNumber()
  @IsNotEmpty()
  amount: number;  // Order amount

  @IsNumber()
  @IsNotEmpty()
  sales_tax: number;  // Sales tax

  @IsOptional()
  @IsNumber()
  total?: number;  // Total amount after applying discounts or coupons

  @IsOptional()
  @IsNumber()
  paid_total?: number;  // Total paid amount

  @IsOptional()
  @IsString()
  payment_id?: string;  // Payment ID (for online payment)

  @IsEnum(PaymentGatewayType)
  @IsNotEmpty()
  payment_gateway: PaymentGatewayType;  // Payment gateway type (e.g., COD, credit card)

  @IsOptional()
  @IsNumber()
  discount?: number;  // Applied discount

  @IsOptional()
  @IsNumber()
  delivery_fee?: number;  // Delivery fee, if applicable

  @IsString()
  @IsNotEmpty()
  delivery_time: string;  // Expected delivery time

  @IsOptional()
  @ValidateNested()
  @Type(() => CardInput)
  card?: CardInput;  // Payment card information for online payments

  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  billing_address?: UserAddressInput;  // Billing address (guest or logged-in users)

  @IsOptional()
  @ValidateNested()
  @Type(() => UserAddressInput)
  shipping_address?: UserAddressInput;  // Shipping address (guest or logged-in users)

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentIntent)
  payment_intent?: PaymentIntent;  // Payment intent for deferred payments or other scenarios

  @IsOptional()
  @IsString()
  language?: string;  // Preferred language for communication

  @IsOptional()
  @IsNumber()
  dealerId?: number;  // Dealer ID if applicable
}


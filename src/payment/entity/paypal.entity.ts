/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Name {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  given_name: string;
  @Column()
  surname: string;
}

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  country_code: string;
}

@Entity()
export class Paypal {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email_address: string;
  @Column()
  account_id: string;
  @ManyToOne(() => Name)
  name: Name;
  @ManyToOne(() => Address)
  address: Address;
}

@Entity()
export class PaymentSource {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Paypal)
  paypal: Paypal;
}

@Entity()
export class PaypalOrderResponse {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  status: string;
  @ManyToOne(() => PaymentSource)
  payment_source: PaymentSource;
  @ManyToMany(() => Link)
  links: Link[];
}

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  href: string;
  @Column()
  rel: string;
  @Column()
  method: string;
}

@Entity()
export class AccessToken {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  scope: string;
  @Column()
  access_token: string;
  @Column()
  token_type: string;
  @Column()
  app_id: string;
  @Column()
  expires_in: number;
  @Column()
  nonce: string;
}

@Entity()
export class Link2 {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  href: string;
  @Column()
  rel: string;
  @Column()
  method: string;
}

@Entity()
export class Payer {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Name)
  name: Name;
  @Column()
  email_address: string;
  @Column()
  payer_id: string;
  @ManyToOne(() => Address)
  address: Address;
}

@Entity()
export class PaypalCaptureOrderResponse {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  status: string;
  @ManyToOne(() => PaymentSource)
  payment_source: PaymentSource;
  @ManyToMany(() => PurchaseUnit)
  @JoinTable()
  purchase_units: PurchaseUnit[];
  @ManyToOne(() => Payer)
  payer: Payer;
  @ManyToMany(() => Link2)
  @JoinTable()
  links: Link2[];
}

@Entity()
export class Name2 {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  full_name: string;
}

@Entity()
export class Address2 {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  address_line_1: string;
  @Column()
  admin_area_2: string;
  @Column()
  admin_area_1: string;
  @Column()
  postal_code: string;
  @Column()
  country_code: string;
}

@Entity()
export class Shipping {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Name2)
  name: Name2;
  @ManyToOne(() => Address2)
  address: Address2;
}

@Entity()
export class Payments {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToMany(() => Capture)
  @JoinTable()
  captures: Capture[];
}
@Entity()
export class PurchaseUnit {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  reference_id: string;
  @ManyToOne(() => Shipping)
  shipping: Shipping;
  @ManyToOne(() => Payments)
  payments: Payments;
}

@Entity()
export class Amount {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  currency_code: string;
  @Column()
  value: string;
}

@Entity()
export class SellerProtection {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  status: string;
  @Column({ type: "json" })
  dispute_categories: string[];
}

@Entity()
export class GrossAmount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;
}

@Entity()
export class PaypalFee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;
}

@Entity()
export class NetAmount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;
}

@Entity()
export class SellerReceivableBreakdown {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GrossAmount, { cascade: true })
  @JoinColumn()
  gross_amount: GrossAmount;

  @ManyToOne(() => PaypalFee, { cascade: true })
  @JoinColumn()
  paypal_fee: PaypalFee;

  @ManyToOne(() => NetAmount, { cascade: true })
  @JoinColumn()
  net_amount: NetAmount;
}

@Entity()
export class Capture {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  status: string;

  @ManyToOne(() => Amount)
  amount: Amount;

  @Column()
  final_capture: boolean;

  @ManyToOne(() => SellerProtection)
  seller_protection: SellerProtection;

  @ManyToOne(() => SellerReceivableBreakdown)
  seller_receivable_breakdown: SellerReceivableBreakdown;

  @ManyToMany(() => Link)
  @JoinTable()
  links: Link[];

  @Column()
  create_time: string;
  @Column()
  update_time: string;
}

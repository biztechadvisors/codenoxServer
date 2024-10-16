/* eslint-disable prettier/prettier */
import { Add } from '@db/src/address/entities/address.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';

// Metadata Entity
@Entity()
export class Metadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  order_tracking_number: number;
}

// Billing Details Entity
@Entity()
export class BillingDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Add, { cascade: true })
  address: Add;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;
}

// Card Entity
@Entity()
export class Card {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  exp_month: number;

  @Column({ nullable: true })
  exp_year: number;

  @Column({ nullable: true })
  fingerprint: string;

  @Column({ nullable: true })
  funding: string;

  @Column({ nullable: true })
  last4: string;
}

@Entity()
export class InvoiceSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  custom_fields?: string;

  @Column({ nullable: true })
  default_payment_method?: string;

  @Column({ nullable: true })
  footer?: string;

  @Column({ nullable: true })
  rendering_options?: string;
}

@Entity()
export class StripeCustomer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  object: string;

  @OneToOne(() => Add, { cascade: true })
  address: Add;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  balance?: number;

  @Column({ nullable: true })
  created?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ nullable: true })
  default_source?: string;

  @Column({ nullable: true })
  delinquent?: boolean;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  discount?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  invoice_prefix?: string;

  @OneToOne(() => InvoiceSettings, { cascade: true })
  invoice_settings?: InvoiceSettings;

  @Column({ nullable: true })
  livemode?: boolean;

  @OneToOne(() => Metadata, { cascade: true })
  metadata?: Metadata;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  next_invoice_sequence?: number;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  tax_exempt?: string;
}

@Entity()
export class StripePaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  object: string;

  @ManyToOne(() => BillingDetails, { cascade: true, })
  billing_details: BillingDetails;

  @ManyToOne(() => Card, { cascade: true, })
  card: Card;

  @Column({ nullable: true })
  created: number;

  @Column({ nullable: true })
  customer: string;

  @Column({ nullable: true })
  livemode: boolean;

  @ManyToOne(() => Metadata, { cascade: true })
  metadata: Metadata;

  @Column({ nullable: true })
  type: string;
}


// Payment Intent Metadata Entity
@Entity()
export class PaymentIntentMetadata {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  order_tracking_number: number;
}

@Entity()
export class StripePaymentIntent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount_received: number;

  @Column({ nullable: true })
  client_secret: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  customer: string;

  @ManyToOne(() => PaymentIntentMetadata, { cascade: true })
  metadata: PaymentIntentMetadata;

  @Column('simple-array', { nullable: true })
  payment_method_types: string[];

  @Column({ nullable: true })
  setup_future_usage: string;

  @Column({ nullable: true })
  status: string;
}



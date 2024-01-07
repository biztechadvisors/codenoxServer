/* eslint-disable prettier/prettier */
import { User } from "aws-sdk/clients/budgets";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StripeCustomerList {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  object?: string;
  @Column()
  url?: string;
  @Column()
  has_more?: boolean;
  @OneToOne(() => StripeCustomer)
  @JoinColumn()
  data?: StripeCustomer[];
}


@Entity()
export class AddressStripe {
  @PrimaryGeneratedColumn()   
  id?: number;
  @Column()
  city?: string;
  @Column()
  country?: string;
  @Column({ type: 'varchar' })
  line1?: string;
  @Column()
  line2?: string;
  @Column({ type: 'varchar' })
  postal_code?: string;
  @Column()
  state?: string;
}

@Entity()
export class InvoiceSettings {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  custom_fields?: string;
  @Column()
  default_payment_method?: string;
  @Column()
  footer?: string;
  @Column()
  rendering_options?: string;
}
@Entity()
export class Metadata {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  order_tracking_number?: string;
}
@Entity()
export class StripeCustomer {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  object?: string;
  @ManyToMany(()=>AddressStripe, address=>address.id)
  @JoinColumn()
  address?: AddressStripe;
  @Column()
  balance?: number;
  @Column()
  created?: number;
  @Column()
  currency?: string;
  @Column({ type: 'varchar' })
  default_source?: any;
  @Column()
  delinquent?: boolean;
  @Column({ type: 'varchar' })
  description?: any;
  @Column({ type: 'varchar' })
  discount?: any;
  @Column({ type: 'varchar' })
  email?: any;
  @Column()
  invoice_prefix?: string;
  @OneToMany(()=>InvoiceSettings, invoice => invoice.id)
  @JoinTable()
  invoice_settings?: InvoiceSettings[];
  @Column()
  livemode?: boolean;
  @OneToMany(()=>Metadata, metadata=> metadata.order_tracking_number)
  @JoinColumn()
  metadata?: Metadata;
  @Column({ type: 'varchar' })
  name?: any;
  @Column()
  next_invoice_sequence?: number;
  @Column({ type: 'varchar' })
  phone?: any;
  @Column({ type: 'varchar' })
  preferred_locales?: any[];
  @Column({ type: 'varchar' })
  shipping?: any;
  @Column()
  tax_exempt?: string;
  @Column({ type: 'varchar' })
  test_clock?: any;
  // stripeCustomer: Promise<InvoiceSettings[]>;
  // id: any;
}
@Entity()
export class BillingDetails {
  @PrimaryGeneratedColumn()
  id?: number;
  @ManyToOne(()=>AddressStripe)
  address?: AddressStripe;
  @Column({ type: 'varchar' })
  email?: any;
  @Column({ type: 'varchar' })
  name?: any;
  @Column({ type: 'varchar' })
  phone?: any;
}
@Entity()
export class Checks {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ type: 'varchar' })
  address_line1_check?: any;
  @Column({ type: 'varchar' })
  address_postal_code_check?: any;
  @Column()
  cvc_check?: string;
}
@Entity()
export class Networks {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ type: 'varchar' })
  available?: string[];
  @Column({ type: 'varchar' })
  preferred?: any;
}
@Entity()
export class ThreeDSecureUsage {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  supported?: boolean;
}
@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  brand?: string;
  @ManyToOne(()=>Checks)
  checks?: Checks;
  @Column()
  country?: string;
  @Column()
  exp_month?: number;
  @Column()
  exp_year?: number;
  @Column()
  fingerprint?: string;
  @Column()
  funding?: string;
  @Column({ type: 'varchar' })
  generated_from?: any;
  @Column()
  last4?: string
  @OneToOne(()=>Networks)
  @JoinColumn()
  networks?: Networks;
  @ManyToOne(()=>ThreeDSecureUsage)
  three_d_secure_usage?: ThreeDSecureUsage;
  @Column({ type: 'varchar' })
  wallet?: any;
}
@Entity()
export class StripePaymentMethod {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  object?: string;
  @ManyToMany(()=>BillingDetails, bill=>bill.address)
  @JoinTable()
  billing_details?: BillingDetails;
  @ManyToMany(()=>Card, card => card.id)
  @JoinTable()
  card?: Card;
  @Column()
  created?: string;
  @Column({ type: 'varchar' })
  customer?: User;
  @Column()
  livemode?: boolean;
  @OneToMany(()=>Metadata, metadata=> metadata.order_tracking_number)
  @JoinColumn()
  metadata?: Metadata;
  @Column()
  type?: string;
}
@Entity()
export class PaymentIntentMetadata {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  order_tracking_number?: number;
}
@Entity()
export class StripePaymentIntent {
  @PrimaryGeneratedColumn()
  id?: string;
  @Column()
  amount?: number;
  @Column()
  amount_received?: number;
  @Column()
  client_secret?: string;
  @Column()
  currency?: string;
  @Column({ type: 'varchar' })
  customer?: any;
  @ManyToOne(()=> PaymentIntentMetadata)
  metadata?: PaymentIntentMetadata;
  @Column({ type: 'varchar' })
  payment_method_types?: string[];
  @Column()
  setup_future_usage?: string;
  @Column()
  status?: string;
}



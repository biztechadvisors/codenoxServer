import { UserAddress } from 'src/addresses/entities/address.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { File, Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderStatus } from './order-status.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { join } from 'path';

export enum PaymentGatewayType {
  STRIPE = 'STRIPE',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CASH = 'CASH',
  FULL_WALLET_PAYMENT = 'FULL_WALLET_PAYMENT',
  PAYPAL = 'PAYPAL',
  RAZORPAY = 'RAZORPAY',
}

export enum OrderStatusType {
  PENDING = 'order-pending',
  PROCESSING = 'order-processing',
  COMPLETED = 'order-completed',
  CANCELLED = 'order-cancelled',
  REFUNDED = 'order-refunded',
  FAILED = 'order-failed',
  AT_LOCAL_FACILITY = 'order-at-local-facility',
  OUT_FOR_DELIVERY = 'order-out-for-delivery',
  DEFAULT_ORDER_STATUS = 'order-pending',
}

export enum PaymentStatusType {
  PENDING = 'payment-pending',
  PROCESSING = 'payment-processing',
  SUCCESS = 'payment-success',
  FAILED = 'payment-failed',
  REVERSAL = 'payment-reversal',
  CASH_ON_DELIVERY = 'payment-cash-on-delivery',
  CASH = 'payment-cash',
  WALLET = 'payment-wallet',
  AWAITING_FOR_APPROVAL = 'payment-awaiting-for-approval',
  DEFAULT_PAYMENT_STATUS = 'payment-pending',
}

@Entity()
export class Order extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tracking_number: string;

  @Column()
  customer_id: number;

  @Column()
  customer_contact: string;

  @ManyToOne(() => User, user => user.orders, {
    eager: true,
  })
  customer: User;

  @ManyToOne(() => Order, order => order.children, { nullable: true })
  @JoinColumn()
  parentOrder: Order;

  @OneToMany(() => Order, order => order.parentOrder)
  children?: Order[];

  @OneToOne(() => OrderStatus)
  @JoinColumn()
  status: OrderStatus;

  @Column()
  order_status: OrderStatusType;

  @Column()
  payment_status: PaymentStatusType;

  @Column()
  amount: number;

  @Column({ nullable: true })
  sales_tax: number;

  @Column()
  total: number;

  @Column()
  paid_total: number;

  @Column()
  payment_id?: string;

  @Column()
  payment_gateway: PaymentGatewayType;

  @ManyToOne(() => Coupon, coupon => coupon.orders, { nullable: true })
  coupon?: Coupon;

  @ManyToMany(() => Shop, { nullable: true })
  @JoinTable()
  shop: Shop;

  @Column({ nullable: true })
  discount?: number;

  @Column({ nullable: true })
  delivery_fee: number;

  @Column({ nullable: true })
  delivery_time: string;

  @ManyToMany(() => Product, product => product.orders)
  @JoinTable()
  products: Product[];

  @ManyToOne(() => UserAddress)
  billing_address: UserAddress;

  @ManyToOne(() => UserAddress)
  shipping_address: UserAddress;

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];

  @OneToOne(() => PaymentIntent)
  @JoinColumn()
  payment_intent: PaymentIntent;

  @Column()
  altered_payment_gateway?: string;

  @Column()
  customerId: any;

  @Column('json', { nullable: true })
  logistics_provider: object;

  @Column('int', { nullable: true })
  shop_id: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cancelled_amount: number;

  @Column()
  wallet_point: number;
}

@Entity()
export class OrderFiles extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  purchase_key: string;
  @Column()
  digital_file_id: number;
  @Column()
  order_id?: number;
  @Column()
  customer_id: number;
  @ManyToOne(() => File, { cascade: true })
  file: File;
  @ManyToOne(() => Product)
  fileable: Product;
}
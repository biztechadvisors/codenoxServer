/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { File, OrderProductPivot, Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderStatus } from './order-status.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { join } from 'path';
import { Stocks } from 'src/stocks/entities/stocks.entity';
import { UserAdd } from '@db/src/address/entities/address.entity';

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
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
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
  PAID = "PAID",
}

@Entity()
export class Order extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ nullable: true })
  customer_id?: number;

  @Column()
  customer_contact: string;

  @ManyToOne(() => User, (user) => user.orders, { eager: true, cascade: true })
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @ManyToOne(() => Order, (order) => order.children, { nullable: true, cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'parentOrderId' })
  parentOrder: Order;

  @OneToMany(() => Order, (order) => order.parentOrder)
  children?: Order[];

  @ManyToOne(() => OrderStatus, (orderStatus) => orderStatus.order, { eager: true, nullable: true, cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'statusId' })
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

  @Column({ nullable: true })
  payment_id?: string;

  @Column()
  payment_gateway: PaymentGatewayType;

  @ManyToOne(() => Coupon, (coupon) => coupon.orders, { nullable: true, cascade: ['insert', 'update'], eager: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon?: Coupon;

  @Column({ type: 'int' })
  shop_id: number;

  @ManyToMany(() => Shop, (shop) => shop.orders, { cascade: ['insert', 'update'] })
  @JoinTable({ name: 'shop_order' })
  shop: Shop[];

  @Column({ nullable: true })
  discount?: number;

  @Column({ nullable: true })
  delivery_fee: number;

  @Column({ nullable: true })
  delivery_time: string;

  @ManyToMany(() => Product, product => product.orders, { cascade: true })
  @JoinTable({
    name: 'order_product',
    joinColumn: { name: 'order_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
  })
  products: Product[];

  @OneToMany(() => OrderProductPivot, (pivot) => pivot.order, { eager: true, cascade: ['insert', 'update'] })
  orderProductPivots: OrderProductPivot[];

  @ManyToOne(() => UserAdd, { nullable: false, cascade: true })
  @JoinColumn({ name: 'billingAddressId' })
  billing_address: UserAdd;

  @ManyToOne(() => UserAdd, { nullable: false, cascade: true })
  @JoinColumn({ name: 'shippingAddressId' })
  shipping_address: UserAdd;

  @Column()
  language: string;
  @Column({ type: 'json', nullable: true })
  translated_languages: any[] | null;

  @OneToOne(() => PaymentIntent, { nullable: true, cascade: true })
  @JoinColumn({ name: 'paymentIntentId' })
  payment_intent: PaymentIntent;

  @Column({ nullable: true })
  altered_payment_gateway?: string;

  @Column({ nullable: true })
  logistics_provider: string;

  @ManyToOne(() => UserAdd, { cascade: true })
  soldByUserAddress: UserAdd;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  cancelled_amount: number;

  @Column({ nullable: true })
  wallet_point: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'dealerId' })
  dealer: User;

  @OneToMany(() => Stocks, (stocks) => stocks.order)
  stocks: Stocks[];
}

@Entity()
export class OrderFiles extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  purchase_key: string;

  @Column({ nullable: true })
  digital_file_id: number;

  @Column()
  order_id?: number;

  @Column({ nullable: true })
  customer_id: number;

  @ManyToOne(() => File, { nullable: true, cascade: true })
  file: File;

  @ManyToOne(() => Product, { nullable: true, cascade: true })
  fileable: Product;
}
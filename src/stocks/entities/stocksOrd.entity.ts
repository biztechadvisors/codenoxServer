/* eslint-disable prettier/prettier */
import { UserAddress } from 'src/addresses/entities/address.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Coupon } from 'src/coupons/entities/coupon.entity';
import { PaymentIntent } from 'src/payment-intent/entries/payment-intent.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderStatusType, PaymentGatewayType, PaymentStatusType } from 'src/orders/entities/order.entity';
import { OrderStatus } from 'src/orders/entities/order-status.entity';
import { Shop } from 'src/shops/entities/shop.entity';

@Entity()
export class StocksSellOrd extends CoreEntity {
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
    shop_id: Shop;

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

    @Column({ type: "json" })
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

    @ManyToOne(() => UserAddress)
    saleBy: UserAddress;

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    cancelled_amount: number;

    @Column()
    wallet_point: number;

    @ManyToOne(() => User, { nullable: true, cascade: true })
    @JoinColumn({ name: 'dealerId' })
    dealer: User;
}
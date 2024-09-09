/* eslint-disable prettier/prettier */
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum CouponType {
  FIXED_COUPON = 'fixed',
  PERCENTAGE_COUPON = 'percentage',
  FREE_SHIPPING_COUPON = 'free_shipping',
  DEFAULT_COUPON = 'fixed',
}

@Entity()
export class Coupon extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  minimum_cart_amount: number;

  @OneToMany(() => Order, (order) => order.coupon)
  orders?: Order[];

  @OneToMany(() => StocksSellOrd, (stocksSellOrd) => stocksSellOrd.coupon)
  stockOrders?: StocksSellOrd[];

  @Column()
  type: CouponType;

  @OneToOne(() => Attachment, { cascade: ['insert', 'update'], eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  image?: Attachment;  // Make this optional to match the `nullable: true` setting

  @Column()
  is_valid: boolean;

  @Column()
  amount: number;

  @Column()
  active_from: string;

  @Column()
  expire_at: string;

  @Column()
  language: string;

  @Column({ type: "json" })
  translated_languages: string[];
}

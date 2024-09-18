/* eslint-disable prettier/prettier */
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @OneToMany(() => Order, (order) => order.coupon, { onDelete: "SET NULL" })
  orders?: Order[];

  @OneToMany(() => StocksSellOrd, (stocksSellOrd) => stocksSellOrd.coupon, { onDelete: "SET NULL" })
  stockOrders?: StocksSellOrd[];

  @Column()
  type: CouponType;

  @OneToOne(() => Attachment, { cascade: true, eager: true })
  @JoinColumn()
  image?: Attachment;

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

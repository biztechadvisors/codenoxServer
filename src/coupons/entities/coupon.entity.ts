import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
  @Column()
  description?: string;
  @Column()
  minimum_cart_amount: number;
  @OneToMany(() => Order, order => order.coupon)
  orders?: Order[];
  type: CouponType;
  image: Attachment;
  is_valid: boolean;
  amount: number;
  active_from: string;
  expire_at: string;
  language: string;
  translated_languages: string[];
}

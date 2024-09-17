/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum RefundStatus {
  APPROVED = 'Approved',
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  PROCESSING = 'Processing',
}

@Entity()
export class Refund extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING,  // Default status to 'Pending'
  })
  status: RefundStatus;

  @ManyToOne(() => Shop, { nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: User;
}

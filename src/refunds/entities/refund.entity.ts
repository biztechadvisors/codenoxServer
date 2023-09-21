import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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
  @Column()
  amount: string;
  @Column()
  status: RefundStatus;
  @OneToOne(() => Shop)
  shop: Shop;
  @OneToOne(() => Order)
  order: Order;
  @OneToOne(() => User)
  customer: User;
}

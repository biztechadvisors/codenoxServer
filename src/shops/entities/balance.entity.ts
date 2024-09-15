/* eslint-disable prettier/prettier */
import { Dealer } from 'src/users/entities/dealer.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { PaymentInfo, Shop } from './shop.entity'


@Entity()
export class Balance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  admin_commission_rate: number;

  @OneToMany(() => Shop, (shop) => shop.balance, { cascade: true })
  @JoinColumn()
  shop: Shop;

  @ManyToOne(() => Dealer, (dealer) => dealer.balance, { nullable: true, onDelete: 'SET NULL' })
  dealer: Dealer;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_earnings: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  withdrawn_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  current_balance: number;

  @OneToOne(() => PaymentInfo, { cascade: true, nullable: true })
  @JoinColumn()
  payment_info?: PaymentInfo;
}
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
  id: number
  @Column()
  admin_commission_rate: number
  @OneToMany(() => Shop, shop => shop.balance, { cascade: true })
  shop: Shop
  @ManyToOne(() => Dealer, (dealer) => dealer.balance)
  dealer: Dealer;
  @Column()
  total_earnings: number
  @Column()
  withdrawn_amount: number
  @Column()
  current_balance: number
  @OneToOne(() => PaymentInfo)
  @JoinColumn()
  payment_info: PaymentInfo
}

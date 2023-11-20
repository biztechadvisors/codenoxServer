/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  // OneToMany,
  // ManyToOne,
  OneToOne,
} from 'typeorm'
import { PaymentInfo, Shop } from './shop.entity'

@Entity()
export class Balance {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  admin_commission_rate: number
  @OneToOne(() => Shop)
  shop: Shop
  @Column()
  total_earnings: number
  @Column()
  withdrawn_amount: number
  @Column()
  current_balance: number
  @OneToOne(() => PaymentInfo)
  payment_info: PaymentInfo
}

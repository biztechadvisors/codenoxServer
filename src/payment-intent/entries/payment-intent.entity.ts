/* eslint-disable prettier/prettier */
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PaymentIntentInfo {
  @PrimaryGeneratedColumn()
  id: number // Add this line
  @Column({ nullable: true })
  client_secret?: string | null
  @Column({ nullable: true })
  redirect_url?: string | null
  @Column()
  payment_id: string
  @Column()
  order_id: string
  @Column()
  is_redirect: boolean
}

@Entity()
export class PaymentIntent {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  order_id: number
  @Column()
  tracking_number: string
  @Column()
  payment_gateway: string;
  @ManyToOne(() => PaymentIntentInfo)
  payment_intent_info: Partial<PaymentIntentInfo>; // Change this line
}

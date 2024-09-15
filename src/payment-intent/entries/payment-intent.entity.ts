/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PaymentIntentInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  client_secret?: string | null;

  @Column({ nullable: true })
  redirect_url?: string | null;

  @Column()
  payment_id: string;

  @Column()
  order_id: string;

  @Column()
  is_redirect: boolean;
}

@Entity()
export class PaymentIntent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  tracking_number: string;

  @Column()
  payment_gateway: string;

  @Column({ nullable: true })
  payment_intent_info_id: number;

  @ManyToOne(() => PaymentIntentInfo, { nullable: true, cascade: true })
  @JoinColumn({ name: 'payment_intent_info_id' })
  payment_intent_info?: PaymentIntentInfo;
}
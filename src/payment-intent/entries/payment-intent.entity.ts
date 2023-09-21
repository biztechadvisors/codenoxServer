import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PaymentIntentInfo {
  @PrimaryGeneratedColumn()
  id: number; // Add this line
  @Column()
  client_secret?: string | null;
  @Column()
  redirect_url?: string | null;
  @Column()
  payment_id: string;
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
  @OneToOne(() => PaymentIntentInfo)
  payment_intent_info: Partial<PaymentIntentInfo>; // Change this line
}


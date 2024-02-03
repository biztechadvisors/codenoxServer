import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Card {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    razorPay_id: string;
    @Column()
    last4: string;
    @Column()
    network: string;
    @Column()
    type: string;
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    entity: string;
    @Column()
    amount: number;
    @Column()
    currency: string;
    @Column()
    status: string;
    @Column()
    order_id: string;
    @Column()
    international: boolean;
    @Column()
    method: string;
    @Column()
    amount_refunded: number;
    @Column()
    captured: boolean;
    @Column()
    description: string;
    @ManyToOne(() => Card)
    card: Card;
    @Column()
    email: string;
    @Column()
    contact: string;
    @Column({ type: "json" })
    notes: object;
    @Column({ nullable: true })
    fee: number;
    @Column({ nullable: true })
    tax: number;
    @Column({ nullable: true })
    error_code: string;
    @Column({ nullable: true })
    error_description: string;
    @Column({ nullable: true })
    error_source: string;
    @Column({ nullable: true })
    error_step: string;
    @Column({ nullable: true })
    error_reason: string;
    @Column({ type: "json" })
    acquirer_data: object;
    @Column()
    created_at: Date;
}

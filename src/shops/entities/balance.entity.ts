import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { PaymentInfo, Shop } from './shop.entity';
import { Dealer } from 'src/users/entities/dealer.entity';

@Entity()
export class Balance {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    admin_commission_rate: number;
    @ManyToOne(() => Shop)
    shop: Shop;
    @ManyToOne(() => Dealer)
    dealer: Dealer;
    @Column()
    total_earnings: number;
    @Column()
    withdrawn_amount: number;
    @Column()
    current_balance: number;
    @ManyToOne(() => PaymentInfo)
    payment_info: PaymentInfo;
}
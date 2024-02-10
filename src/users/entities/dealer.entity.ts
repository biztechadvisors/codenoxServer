/* eslint-disable prettier/prettier */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from './user.entity';

export enum SubscriptionType {
    SILVER = 'silver',
    GOLD = 'gold',
    PLATINUM = 'platinum',
}

@Entity()
export class Dealer {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @Column()
    phone: number;

    @Column()
    name: string;
    @Column({ type: 'enum', enum: SubscriptionType })
    subscriptionType: SubscriptionType;

    @CreateDateColumn()
    subscriptionStart: Date;

    @UpdateDateColumn()
    subscriptionEnd: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    discount: number;
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    walletBalance: number;
    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => DealerProductMargin, dealerProductMargin => dealerProductMargin.dealer)
    dealerProductMargins: DealerProductMargin[];

    @OneToMany(() => DealerCategoryMargin, dealerCategoryMargin => dealerCategoryMargin.dealer)
    dealerCategoryMargins: DealerCategoryMargin[];
}

@Entity()
export class DealerProductMargin {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dealer, dealer => dealer.dealerProductMargins)
    @JoinColumn()
    dealer: Dealer;

    @ManyToOne(() => Product)
    @JoinColumn()
    product: Product;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    margin: number;
    
    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}

@Entity()
export class DealerCategoryMargin {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Dealer, dealer => dealer.dealerCategoryMargins)
    @JoinColumn()
    dealer: Dealer;

    @ManyToOne(() => Category)
    @JoinColumn()
    category: Category;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    margin: number;
    @Column({ type: 'boolean', default: true })
    isActive: boolean;
}
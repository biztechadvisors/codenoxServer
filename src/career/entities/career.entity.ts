import { Shop } from '@db/src/shops/entities/shop.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Career {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column()
    phone: string;

    @Column()
    email: string;

    @Column()
    position: string;

    @Column()
    location: string;

    @Column({ nullable: true })
    cv_resume?: string;

    @ManyToOne(() => Shop, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;
}

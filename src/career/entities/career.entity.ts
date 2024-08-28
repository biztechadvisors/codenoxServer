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
    cv_resume?: string;  // You can store the path or URL of the uploaded CV/Resume

    @ManyToOne(() => Shop, { eager: true }) // Load related Shop data eagerly
    @JoinColumn({ name: 'shop_id' }) // Name of the foreign key column in the Contact table
    shop: Shop;
}

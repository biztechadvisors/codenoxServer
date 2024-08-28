import { Shop } from '@db/src/shops/entities/shop.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    location?: string;

    @Column()
    subject: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ nullable: true })
    file?: string; // Path to the uploaded file

    @ManyToOne(() => Shop, { eager: true }) // Load related Shop data eagerly
    @JoinColumn({ name: 'shop_id' }) // Name of the foreign key column in the Contact table
    shop: Shop;
}

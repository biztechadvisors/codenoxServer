import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Add } from '@db/src/address/entities/address.entity';
import { Shop } from '@db/src/shops/entities/shop.entity';
import { Career } from './career.entity';
import { CoreEntity } from '@db/src/common/entities/core.entity';

@Entity()
export class Vacancy extends CoreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    employmentType: string;  // Full-time, Part-time, Contract, etc.

    @Column()
    salaryRange: string;  // Example: "50,000 - 70,000"

    @ManyToOne(() => Add, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'address_id' })
    location: Add;

    @ManyToOne(() => Shop, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'shop_id' })
    shop: Shop;

    @OneToMany(() => Career, career => career.vacancy, { cascade: true })
    career: Career[];
}

import { Shop } from '@db/src/shops/entities/shop.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Vacancy } from './vacancies.entity';
import { CoreEntity } from '@db/src/common/entities/core.entity';

@Entity()
export class Career extends CoreEntity {
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

    @ManyToOne(() => Vacancy, vacancy => vacancy.career, { onUpdate: 'CASCADE' })
    vacancy: Vacancy;
}

// src/get-inspired/entities/get-inspired.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

@Entity()
export class GetInspired {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    type: string; // You can use an enum type if there are specific types

    @ManyToOne(() => Shop)
    shop: Shop;

    @ManyToMany(() => Attachment, { cascade: true, eager: true })
    @JoinTable({
        name: 'get_inspired_images',
        joinColumn: { name: 'getInspiredId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    })
    images: Attachment[];
}

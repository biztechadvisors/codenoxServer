// src/get-inspired/entities/get-inspired.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';

@Entity()
export class GetInspired {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    type: string;

    @ManyToOne(() => Shop)
    shop: Shop;

    @ManyToMany(() => Attachment, { cascade: true, eager: true })
    @JoinTable({
        name: 'get_inspired_images',
        joinColumn: { name: 'getInspiredId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    })
    images: Attachment[];

    @ManyToMany(() => Tag, { cascade: true, eager: true })
    @JoinTable({
        name: 'get_inspired_tags',
        joinColumn: { name: 'get_inspiredId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    })
    tags?: Tag[];

}

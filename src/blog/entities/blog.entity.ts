/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';

@Entity()
export class Blog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({
        type: 'text'
    })
    content: string;

    @ManyToOne(() => Shop)
    shop: Shop;

    @ManyToMany(() => Attachment, { cascade: true, eager: true })
    @JoinTable({
        name: 'blog_attachments',
        joinColumn: { name: 'blogId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    })
    attachments?: Attachment[];
}

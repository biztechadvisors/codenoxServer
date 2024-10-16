/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Region } from '@db/src/region/entities/region.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';

@Entity()
export class Blog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'date' })
    date: string;

    @ManyToOne(() => Shop, { nullable: false, onDelete: 'CASCADE', onUpdate: "CASCADE" })
    shop: Shop;

    @ManyToMany(() => Attachment, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinTable({
        name: 'blog_attachments',
        joinColumn: { name: 'blogId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    })
    attachments?: Attachment[];

    @ManyToOne(() => Region, (region) => region.blogs, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
    region: Region;

    @ManyToMany(() => Tag, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinTable({
        name: 'blog_tags',
        joinColumn: { name: 'blogId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
    })
    tags?: Tag[];
}

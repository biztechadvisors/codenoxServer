/* eslint-disable prettier/prettier */
import { Shop } from 'src/shops/entities/shop.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { QnA } from './qna.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

@Entity()
export class FAQ {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @ManyToMany(() => Attachment, { eager: true })
    @JoinTable({
        name: 'faq_images',
        joinColumn: { name: 'faqId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    })
    images?: Attachment[];

    @ManyToOne(() => Shop)
    shop: Shop;

    @OneToMany(() => QnA, qna => qna.faq, { onDelete: "CASCADE" })
    qnas: QnA[];
}
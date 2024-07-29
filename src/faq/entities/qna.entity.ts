/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { FAQ } from './faq.entity';

export enum QnAType {
    GENERAL_QUESTION = 'GENERAL_QUESTION',
    SHIPPING_PRODUCTS_INSTALLATION = 'SHIPPING_PRODUCTS_INSTALLATION'
}

@Entity()
export class QnA {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    answer: string;

    @Column({
        type: 'enum',
        enum: QnAType,
        default: QnAType.GENERAL_QUESTION
    })
    type: QnAType;

    @ManyToOne(() => FAQ, faq => faq.qnas)
    faq: FAQ;
}

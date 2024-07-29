/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    eventName: string;

    @Column('text')
    description: string;

    @Column()
    date: string;

    @Column()
    time: string;

    @Column()
    location: string;

    @Column()
    collaboration: string;

    @ManyToOne(() => Shop)
    shop: Shop;

    @ManyToMany(() => Attachment, { cascade: true, eager: true })
    @JoinTable({
        name: 'event_attachments',
        joinColumn: { name: 'eventId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    })
    images?: Attachment[];
}

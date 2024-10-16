/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Region } from '@db/src/region/entities/region.entity';

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

    @Column({ type: 'date' })
    date: string; // You can use `Date` type here if you prefer

    @Column({ type: 'time' })
    time: string; // You can use `Date` type here if you prefer

    @Column()
    location: string;

    @Column()
    collaboration: string;

    @ManyToOne(() => Shop, (shop) => shop.events, { onDelete: "CASCADE" })
    shop: Shop;

    @ManyToMany(() => Attachment, { cascade: true })
    @JoinTable({
        name: 'event_attachments',
        joinColumn: { name: 'eventId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    })
    images?: Attachment[];

    @ManyToOne(() => Region, (region) => region.events, { nullable: true, onDelete: 'CASCADE' })
    region: Region;
}

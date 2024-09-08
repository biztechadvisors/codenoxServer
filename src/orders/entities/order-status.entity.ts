/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderStatus extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  color: string;
  @Column()
  serial: number;
  @Column()
  slug: string;
  @Column()
  language: string;
  @Column({ type: "json" })
  translated_languages: string[];
  @OneToMany(() => Order, (order) => order.status)
  order: Order;
}

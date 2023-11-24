import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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
  @OneToOne(() => Order, order => order.status)
  order: Order;

}

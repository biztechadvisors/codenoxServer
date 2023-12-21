<<<<<<< HEAD
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
=======
import { CoreEntity } from 'src/common/entities/core.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

@Entity()
export class OrderStatus extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  name: string
  @Column()
  color: string
  @Column()
  serial: number
  @Column()
  slug: string
  @Column()
<<<<<<< HEAD
  language: string;
  @Column({ type: "json" })
  translated_languages: string[];
  @OneToOne(() => Order, order => order.status)
  order: Order;

=======
  language: string
  @Column({ type: 'json' })
  translated_languages: string[]
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
}

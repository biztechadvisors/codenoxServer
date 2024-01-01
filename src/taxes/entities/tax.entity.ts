/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tax extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  rate: number;
  @Column()
  is_global: boolean;
  @Column()
  country?: string;
  @Column()
  state?: string;
  @Column()
  zip?: string;
  @Column()
  city?: string;
  @Column()
  priority?: number;
  @Column()
  on_shipping: boolean;
  @OneToOne(() => Product)
  @JoinColumn()
  product: Product
}
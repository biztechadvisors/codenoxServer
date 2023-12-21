/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attribute } from './attribute.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AttributeValue extends CoreEntity {
  // [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shop_id: number;

  @Column()
  value: string;

  @Column()
  meta?: string;

  @ManyToOne(() => Attribute, attribute => attribute.values)
  attribute: Attribute;
  // title: string;
  // price: number;
  // sku: string;
  // is_disable: boolean;
  // sale_price: number;
  // quantity: number;
  // options: boolean;
}
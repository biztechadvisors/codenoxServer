/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attribute } from './attribute.entity';
import { Column, Entity, FindOperator, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AttributeValue extends CoreEntity {
  // [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  shop_id: number

  @Column()
  value: string

  @Column()
  meta?: string

  @ManyToOne(() => Attribute, (attribute) => attribute.values, { onDelete: 'CASCADE' })
  attribute: Attribute;
}

/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { AttributeValue } from './attribute-value.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attribute extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shop_id: string;

  @OneToOne(() => Shop)
  @JoinColumn()
  shop: Shop;

  @Column()
  slug: string;

  @OneToMany(() => AttributeValue, attributeValue => attributeValue.attribute, {
    onDelete: 'CASCADE',
  })
  values: AttributeValue[];

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];
}
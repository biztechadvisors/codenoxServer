import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { AttributeValue } from './attribute-value.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Attribute extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  shop_id: string;

  @ManyToOne(() => Shop)
  @JoinColumn()
  shop: Shop;

  @Column()
  slug: string;

  @OneToMany(() => AttributeValue, attributeValue => attributeValue.attribute)
  values: AttributeValue[];

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];
}

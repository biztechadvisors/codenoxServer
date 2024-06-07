/* eslint-disable prettier/prettier */
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Type } from 'src/types/entities/type.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  parent: number | null;

  @Column()
  details: string;

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'imageId', referencedColumnName: 'id' })
  image: Attachment | null;

  @Column()
  icon: string;

  @ManyToOne(() => Type, (type) => type.tags, { nullable: true, eager: true, onDelete: 'SET NULL' })
  type: Type | null;

  @ManyToMany(() => Product, (product) => product.tags, { cascade: true })
  @JoinTable({ name: 'product_tags' })
  products: Product[];

  @ManyToOne(() => Shop, { cascade: true })
  @JoinColumn()
  shop?: Shop;

  @Column()
  language: string;

  @Column({ type: 'json' })
  translatedLanguages: string[];
}




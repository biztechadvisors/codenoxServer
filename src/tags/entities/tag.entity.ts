/* eslint-disable prettier/prettier */
import { Region } from '@db/src/region/entities/region.entity';
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

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  parent: number | null;

  @Column({ nullable: true })
  details: string;

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'imageId', referencedColumnName: 'id' })
  image: Attachment | null;

  @Column({ nullable: true })
  icon: string;

  @ManyToOne(() => Type, (type) => type.tags, { nullable: true, eager: true, onDelete: 'SET NULL' })
  type: Type | null;

  @ManyToMany(() => Region, (region) => region.tags, { nullable: true, cascade: true })
  @JoinTable({ name: 'tags_regions' })
  regions: Region[];

  @ManyToMany(() => Product, (product) => product.tags, { cascade: true })
  @JoinTable({ name: 'product_tags' })
  products: Product[];

  @ManyToOne(() => Shop, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  shop?: Shop;

  @Column()
  language: string;

  @Column({ type: 'json', nullable: true })
  translatedLanguages: string[];
}

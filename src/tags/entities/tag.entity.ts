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

  @ManyToOne(() => Attachment, { cascade: true, eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: 'imageId', referencedColumnName: 'id' })
  image: Attachment | null;

  @Column({ nullable: true })
  icon: string;

  @ManyToOne(() => Type, (type) => type.tags, { onDelete: 'SET NULL' })
  type: Type | null;

  @ManyToMany(() => Region, (region) => region.tags)
  @JoinTable({
    name: 'tags_regions',
    joinColumn: { name: 'tagsId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
  })
  regions: Region[];

  @ManyToMany(() => Product, (product) => product.tags)
  products: Product[];

  @ManyToOne(() => Shop, { onDelete: "SET NULL" })
  @JoinColumn()
  shop?: Shop;

  @Column()
  language: string;

  @Column({ type: 'json', nullable: true })
  translatedLanguages: string[];
}

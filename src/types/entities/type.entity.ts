/* eslint-disable prettier/prettier */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Attachment } from 'src/common/entities/attachment.entity'
import { CoreEntity } from 'src/common/entities/core.entity'
import { Product } from 'src/products/entities/product.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { Tag } from 'src/tags/entities/tag.entity'
import { Category } from 'src/categories/entities/category.entity'
import { Region } from '@db/src/region/entities/region.entity'

// TypeSettings entity
@Entity()
export class TypeSettings {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  isHome: boolean
  @Column()
  layoutType: string
  @Column()
  productCard: string
}

@Entity()
export class Type extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToOne(() => Attachment, { cascade: true })
  @JoinColumn()
  image: Attachment;

  @Column()
  icon: string;

  @OneToMany(() => Banner, (banner) => banner.type, { onDelete: "CASCADE" })
  banners?: Banner[];

  @ManyToMany(() => Attachment, { onDelete: "CASCADE" })
  @JoinTable({
    name: 'type_promotional_sliders',
    joinColumn: { name: 'typeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
  })
  promotional_sliders?: Attachment[];

  @OneToOne(() => TypeSettings, { cascade: true, onDelete: 'SET NULL' })
  @JoinColumn()
  settings?: TypeSettings;

  @OneToMany(() => Product, (product) => product.type, { onDelete: "SET NULL" })
  products?: Product[];

  @OneToMany(() => Tag, (tag) => tag.type, { onDelete: "SET NULL" })
  tags?: Tag[];

  @OneToMany(() => Category, (category) => category.type, { onDelete: "SET NULL" })
  categories?: Category[];

  @ManyToOne(() => Shop)
  @JoinColumn()
  shop?: Shop;

  @ManyToMany(() => Region, (region) => region.types, { onDelete: "CASCADE" })
  @JoinTable({
    name: 'types_regions',
    joinColumn: { name: 'typeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
  })
  regions: Region[];

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];
}

// Banner entity
@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number
  @Column({ nullable: true })
  title?: string
  @Column({ nullable: true })
  description?: string
  @ManyToOne(() => Type, (type) => type.banners, { onDelete: "SET NULL" })
  type: Type;

  @ManyToOne(() => Attachment, { cascade: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'imageId' })
  image: Attachment | null;
}

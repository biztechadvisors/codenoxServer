/* eslint-disable prettier/prettier */
import { Region } from '@db/src/region/entities/region.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Type } from 'src/types/entities/type.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToOne(() => Category, { nullable: true })
  @JoinColumn()
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];

  @OneToMany(() => SubCategory, subCategory => subCategory.category)
  subCategories: SubCategory[];

  @ManyToOne(() => Region, (region) => region.categories, { nullable: true, onDelete: 'CASCADE' })
  region: Region;

  @Column()
  details?: string;

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  image?: Attachment;

  @Column()
  icon?: string;

  @ManyToOne(() => Type, (type) => type.categories, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'typeId' })
  type: Type | null;

  @ManyToMany(() => Product, product => product.categories)
  @JoinTable({ name: "product_category" })
  products: Product[];

  @ManyToOne(() => Shop, shop => shop.category)
  shop?: Shop;

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];

  @Column()
  products_count: number;
}

@Entity()
export class SubCategory extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  slug: string

  @ManyToOne(() => Category, category => category.subCategories)
  category: Category;

  @ManyToMany(() => Product, product => product.subCategories, { cascade: true })
  @JoinTable({ name: "product_subcategory" })
  products: Product[];

  @ManyToOne(() => Shop, shop => shop.subCategories)
  shop: Shop;

  @ManyToOne(() => Region, (region) => region.subCategories, { nullable: true, onDelete: 'CASCADE' })
  region: Region;

  @Column()
  details?: string

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  image?: Attachment;

  @Column()
  language: string

  @Column({ type: 'json' })
  translated_languages: string[]
}

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

  @OneToOne(() => Category, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn()
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent, { onDelete: "CASCADE" })
  children?: Category[];

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category, { onDelete: "CASCADE" })
  subCategories: SubCategory[];

  @ManyToMany(() => Region, (region) => region.categories, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({
    name: 'categories_regions',
    joinColumn: { name: 'categoryId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
  })
  regions: Region[];

  @Column({ nullable: true })
  details?: string;

  @ManyToOne(() => Attachment, { onDelete: "CASCADE", onUpdate: "CASCADE", eager: true, nullable: true })
  @JoinColumn()
  image?: Attachment;

  @Column({ nullable: true })
  icon?: string;

  @ManyToOne(() => Type, (type) => type.categories, { nullable: true, onDelete: 'SET NULL', onUpdate: "CASCADE" })
  @JoinColumn({ name: 'typeId' })
  type: Type | null;

  @ManyToMany(() => Product, (product) => product.categories, { onDelete: "CASCADE" })
  products: Product[];

  @ManyToOne(() => Shop, (shop) => shop.categories, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  shop?: Shop;

  @Column()
  language: string;

  @Column({ type: 'json', nullable: true })
  translated_languages: string[];

  @Column({ default: 0 })
  products_count: number;
}

@Entity()
export class SubCategory extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @ManyToOne(() => Category, (category) => category.subCategories, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  category: Category;

  @ManyToMany(() => Product, (product) => product.subCategories, { onDelete: "CASCADE" })
  products: Product[];

  @ManyToOne(() => Shop, (shop) => shop.subCategories, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  shop: Shop;

  @ManyToMany(() => Region, (region) => region.subCategories, { nullable: true, onDelete: 'CASCADE' })
  @JoinTable({
    name: 'subcategories_regions', // Table name
    joinColumn: { name: 'subCategoryId', referencedColumnName: 'id' }, // Correct the column name
    inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
  })
  regions: Region[];

  @Column()
  details?: string;

  @ManyToOne(() => Attachment, { onDelete: "CASCADE", onUpdate: "CASCADE", eager: true, nullable: true })
  @JoinColumn()
  image?: Attachment;

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];
}


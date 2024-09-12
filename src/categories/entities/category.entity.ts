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

  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  subCategories: SubCategory[];

  @ManyToMany(() => Region, (region) => region.categories, { nullable: true, cascade: true })
  @JoinTable({
    name: 'categories_regions',
    joinColumn: { name: 'categoryId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
  })
  regions: Region[];

  @Column({ nullable: true })
  details?: string;

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  image?: Attachment;

  @Column({ nullable: true })
  icon?: string;

  @ManyToOne(() => Type, (type) => type.categories, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'typeId' })
  type: Type | null;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];

  @ManyToOne(() => Shop, (shop) => shop.category)
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

  @ManyToOne(() => Category, (category) => category.subCategories)
  category: Category;

  @ManyToMany(() => Product, (product) => product.subCategories, { cascade: true })
  products: Product[];

  @ManyToOne(() => Shop, (shop) => shop.subCategories)
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

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  image?: Attachment;

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];
}


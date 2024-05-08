/* eslint-disable prettier/prettier */
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Category, SubCategory } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tax } from 'src/taxes/entities/tax.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Attribute } from 'src/attributes/entities/attribute.entity';
import { Stocks } from 'src/stocks/entities/stocks.entity';

enum ProductStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
}
export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
}

@Entity()
export class Product extends CoreEntity {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  slug: string;
  @Column()
  type_id: number;
  @Column()
  product_type: ProductType;

  @ManyToOne(() => Type, (type) => type.product, { eager: true, cascade: true })
  type: Type;

  @ManyToMany(() => Category, category => category.products, { eager: true, cascade: true })
  @JoinTable({ name: "product_category" })
  categories: Category[];

  @ManyToMany(() => SubCategory, subCategory => subCategory.products)
  @JoinTable({ name: "product_subcategory" })
  subCategories: SubCategory[];

  @ManyToMany(() => Tag, tag => tag.products)
  @JoinTable({ name: "product_tags" })
  tags: Tag[];

  @ManyToMany(() => AttributeValue, { cascade: true, })
  @JoinTable()
  variations?: AttributeValue[];

  @ManyToMany(() => Variation, { cascade: true })
  @JoinTable()
  variation_options: Variation[];

  @OneToMany(() => OrderProductPivot, orderProductPivot => orderProductPivot.product)
  pivot?: OrderProductPivot[];

  @ManyToMany(() => Order, order => order.products)
  @JoinTable({ name: "product_order" })
  orders: Order[];

  @ManyToMany(() => StocksSellOrd, StocksSellOrd => StocksSellOrd.products)
  @JoinTable({ name: "product_StocksSellOrd" })
  StocksSellOrd: StocksSellOrd[];

  @ManyToOne(() => Shop, (shop) => shop.product, { eager: true, cascade: true })
  shop: Shop;

  @Column()
  shop_id: number;

  @ManyToMany(() => Product, { cascade: true, })
  @JoinTable()
  related_products?: Product[];

  @OneToMany(() => Review, review => review.product, { eager: true })
  my_review?: Review[];

  @ManyToOne(() => Tax, (tax) => tax.products, { eager: true, cascade: true })
  taxes: Tax;

  @ManyToMany(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinTable({ name: 'gallery' })
  gallery?: Attachment[];

  @ManyToOne(() => Attachment, { cascade: true, nullable: true })
  @JoinColumn({ name: 'image_id' })
  image?: Attachment;

  @Column()
  description: string;
  @Column()
  in_stock: boolean;
  @Column()
  is_taxable: boolean;
  @Column()
  sale_price?: number;
  @Column({ nullable: true })
  max_price?: number;
  @Column({ nullable: true })
  min_price?: number;
  @Column()
  sku?: string;
  @Column()
  status: ProductStatus;
  @Column()
  height?: string;
  @Column()
  length?: string;
  @Column()
  width?: string;
  @Column()
  price?: number;
  @Column()
  quantity: number;
  @Column()
  unit: string;
  @Column()
  ratings: number;
  @Column()
  in_wishlist: boolean;
  @Column()
  language?: string;
  @Column({ type: "json" })
  translated_languages?: string[];
}

@Entity()
export class OrderProductPivot extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  variation_option_id?: number;
  @Column()
  order_quantity: number;
  @Column()
  unit_price: number;
  @Column()
  subtotal: number;
  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;
  @ManyToOne(() => Order, order => order.products)
  @JoinColumn()
  order: Order;
  @ManyToOne(() => StocksSellOrd, stocksSellOrd => stocksSellOrd.products)
  @JoinColumn()
  StocksSellOrd: StocksSellOrd;
  @Column()
  Ord_Id: number
}


@Entity()
export class File extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  attachment_id: number;
  @Column()
  url: string;
  @Column()
  fileable_id: number;
}

@Entity()
export class Variation {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  price: number;
  @Column()
  sku: string;
  @Column()
  is_disable: boolean;
  @Column()
  sale_price?: number;
  @Column()
  quantity: number;

  @ManyToMany(() => VariationOption, { cascade: true, eager: true })
  @JoinTable()
  options: VariationOption[];

  @ManyToOne(() => File)
  @JoinColumn({ name: 'image_id' })
  image: File;

  @Column()
  value: string;
  @Column()
  meta: string;
  @Column()
  created_at: Date;
  @Column()
  updated_at: Date;
}

@Entity()
export class VariationOption {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  value: string;
}

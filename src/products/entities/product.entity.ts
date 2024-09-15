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
import { Region } from '@db/src/region/entities/region.entity';
import { User } from '@db/src/users/entities/user.entity';

enum ProductStatus {
  PUBLISH = 'Publish',
  DRAFT = 'Draft',
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

  @ManyToOne(() => Type, (type) => type.products, { nullable: true, cascade: true })
  @JoinColumn({ name: 'typeId' })
  type: Type | null;

  @ManyToMany(() => Region, (region) => region.products, { nullable: true, cascade: true })
  @JoinTable({
    name: 'product_regions',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
  })
  regions: Region[];

  @ManyToMany(() => Category, category => category.products, { eager: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({ name: "product_category" })
  categories: Category[];

  @ManyToMany(() => SubCategory, subCategory => subCategory.products, { cascade: true })
  @JoinTable({ name: "product_subcategory" })
  subCategories: SubCategory[];

  @ManyToMany(() => Tag, tag => tag.products, { cascade: true })
  @JoinTable({ name: "product_tags" })
  tags: Tag[];

  @ManyToMany(() => AttributeValue, { cascade: true, })
  @JoinTable({ name: "products_attributeValue" })
  variations?: AttributeValue[];

  @ManyToMany(() => Variation, { cascade: true })
  @JoinTable({ name: "products_variationOptions" })
  variation_options: Variation[];

  @OneToMany(() => OrderProductPivot, orderProductPivot => orderProductPivot.product)
  pivot?: OrderProductPivot[];

  @ManyToMany(() => Order, (order) => order.products)
  orders: Order[];

  @ManyToMany(() => StocksSellOrd, stocksSellOrd => stocksSellOrd.products, { onDelete: "CASCADE" })
  stocksSellOrders: StocksSellOrd[];

  @ManyToOne(() => Shop, (shop) => shop.products, { cascade: true })
  shop: Shop;

  @Column()
  shop_id: number;

  @ManyToMany(() => Product, { cascade: true, })
  @JoinTable({ name: "products_relatedProducts" })
  related_products?: Product[];

  @OneToMany(() => Review, review => review.product, { eager: true })
  my_review?: Review[];

  @ManyToOne(() => Tax, (tax) => tax.products, { eager: true, cascade: true })
  taxes: Tax;

  @ManyToMany(() => Attachment, { cascade: true, eager: true })
  @JoinTable({ name: 'products_gallery' })
  gallery?: Attachment[];

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinColumn({ name: 'image_id' })
  image?: Attachment;

  // @ManyToOne(() => User, { nullable: true, cascade: true })
  // @JoinColumn({ name: 'addedByUserId' })
  // addedByUser?: User;

  // @ManyToOne(() => Unit, (unit) => unit.products, { nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn({ name: 'unitId' })
  // unit: Unit;

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
  @Column()
  Google_Shopping?: string;
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
  @ManyToOne(() => Order, (order) => order.orderProductPivots, { cascade: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.pivot, { cascade: true, eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;
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
  @Column({ nullable: true })
  attachment_id: number;
  @Column({ nullable: true })
  url: string;
  @Column({ nullable: true })
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
  @JoinTable({ name: "variation_variationOption" })
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

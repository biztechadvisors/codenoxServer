import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => Type, (type) => type.product, { eager: true, cascade: true })
  type: Type;

  @Column()
  type_id: number;

  @Column()
  product_type: ProductType;

  @ManyToMany(() => Category, category => category.products)
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Tag, tag => tag.products, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @ManyToMany(() => AttributeValue, { cascade: true })
  @JoinTable()
  variations?: AttributeValue[];

  @ManyToMany(() => Variation, { cascade: true })
  @JoinTable()
  variation_options?: Variation[];

  @OneToMany(() => OrderProductPivot, orderProductPivot => orderProductPivot.product)
  pivot?: OrderProductPivot[];

  @ManyToMany(() => Order, order => order.products, { eager: true, cascade: true })
  @JoinTable()
  orders: Order[];

  @ManyToOne(() => Shop, { eager: true, cascade: true })
  shop: Shop;

  @Column()
  shop_id: number;

  @ManyToMany(() => Product, { cascade: true })
  @JoinTable()
  related_products?: Product[];

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

  @ManyToMany(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinTable({ name: 'gallery' })
  gallery?: Attachment[];

  @ManyToOne(() => Attachment, { cascade: true, nullable: true })
  @JoinColumn({ name: 'image_id' })
  image?: Attachment;

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

  @OneToMany(() => Review, review => review.product, { eager: true })
  my_review?: Review[];

  @Column()
  language?: string;
  @Column({ type: "json" })
  translated_languages?: string[];
}

@Entity()
export class OrderProductPivot {
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
  product: Product;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order_id: Order;
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
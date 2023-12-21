/* eslint-disable prettier/prettier */
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

enum ProductStatus {
  PUBLISH = 'publish',
  DRAFT = 'draft',
}

enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
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
}

@Entity()
export class Product extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  slug: string;
  @OneToOne(() => Type, { eager: true })
  @JoinColumn()
  type: Type;
  @Column()
  type_id: number;
  @Column()
  product_type: ProductType;

  @ManyToMany(() => Category, category => category.products)
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Tag, tag => tag.products)
  @JoinTable()
  tags: Tag[];

  @ManyToMany(() => AttributeValue)
  @JoinTable()
  variations?: AttributeValue[];

  @ManyToMany(() => Variation)
  @JoinTable()
  variation_options?: Variation[];

  @OneToOne(() => OrderProductPivot)
  @JoinColumn()
  pivot?: OrderProductPivot;

  @ManyToMany(() => Order, order => order.products)
  orders: Order[];

  @OneToOne(() => Shop)
  @JoinColumn()
  shop: Shop;

  @Column()
  shop_id: number;

  @ManyToMany(() => Product)
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
  @Column()
  max_price?: number;
  @Column()
  min_price?: number;
  @Column()
  sku?: string;

  @ManyToMany(() => Attachment)
  @JoinTable({ name: 'gallery' })
  gallery?: Attachment[];

  @OneToOne(() => Attachment)
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

  @OneToMany(() => Review, review => review.product)
  my_review?: Review[];

  @Column()
  language?: string;
  @Column({ type: 'json' })
  translated_languages?: string[];
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

  @ManyToMany(() => VariationOption)
  @JoinTable()
  options: VariationOption[];

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

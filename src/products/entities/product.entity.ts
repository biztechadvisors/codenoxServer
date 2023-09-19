import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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
  @OneToOne(() => Type)
  type: Type;
  @Column()
  type_id: number;
  @Column()
  product_type: ProductType;
  @OneToMany(() => Category, category => category.products)
  categories: Category[];
  @OneToMany(() => Tag, tag => tag.products)
  tags?: Tag[];
  @ManyToMany(() => AttributeValue)
  variations?: AttributeValue[];
  @OneToOne(() => Variation)
  variation_options?: Variation[];
  @OneToOne(() => OrderProductPivot)
  pivot?: OrderProductPivot;
  @OneToMany(() => Order, order => order.products)
  orders?: Order[];
  @OneToOne(() => Shop)
  shop: Shop;
  @Column()
  shop_id: number;
  @ManyToMany(() => Product)
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
  @OneToOne(() => Attachment)
  gallery?: Attachment[];
  @Column()
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
  @Column()
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
  @OneToOne(() => VariationOption)
  options: VariationOption[];
}

@Entity()
export class VariationOption {
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

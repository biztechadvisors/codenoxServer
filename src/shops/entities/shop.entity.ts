/* eslint-disable prettier/prettier */
import { UserAddress } from 'src/addresses/entities/address.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { CoreEntity } from 'src/common/entities/core.entity'
// import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Balance } from './balance.entity'
import { ShopSettings } from './shopSettings.entity'
import { Category } from 'src/categories/entities/category.entity'
import { Product } from 'src/products/entities/product.entity'
import { Order } from 'src/orders/entities/order.entity'

@Entity()
export class Shop extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @ManyToOne(() => User, (user) => user.shops)
  owner: User;

  @OneToMany(() => User, (user) => user.managed_shop)
  staffs?: User[];

  @Column()
  is_active: boolean;

  @Column()
  orders_count: number;

  @Column()
  products_count: number;

  @ManyToOne(() => Balance, (balance) => balance.shop)
  balance?: Balance;

  @OneToMany(() => Product, (product) => product.shop)
  product?: Product[];

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  description?: string;

  @OneToOne(() => Attachment, { cascade: true })
  @JoinColumn()
  cover_image: Attachment;

  @OneToOne(() => Attachment, { cascade: true })
  @JoinColumn()
  logo?: Attachment;

  @OneToOne(() => UserAddress, { cascade: true })
  @JoinColumn()
  address: UserAddress;

  @OneToOne(() => ShopSettings, { cascade: true })
  @JoinColumn()
  settings?: ShopSettings;

  @Column()
  gst_number: string;

  @OneToMany(() => Category, (category) => category.shop)
  category: Category[]

  @ManyToMany(() => Order, (order) => order.shop_id, { cascade: true, nullable: true })
  @JoinTable({ name: "shop_order" })
  order: Order[];
}

@Entity()
export class PaymentInfo {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  account: string;
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  bank: string;
}
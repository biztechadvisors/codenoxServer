/* eslint-disable prettier/prettier */
import { UserAdd } from 'src/address/entities/address.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { CoreEntity } from 'src/common/entities/core.entity'
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
import { Category, SubCategory } from 'src/categories/entities/category.entity'
import { Product } from 'src/products/entities/product.entity'
import { Order } from 'src/orders/entities/order.entity'
import { Permission } from 'src/permission/entities/permission.entity'
import { Region } from '@db/src/region/entities/region.entity'
import { Event } from '@db/src/events/entities/event.entity'

@Entity()
export class Shop extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @ManyToOne(() => User, (user) => user.owned_shops, {
    nullable: true,
  })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => User, (user) => user.managed_shop, { onDelete: 'CASCADE' })
  staffs?: User[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  orders_count: number;

  @Column({ default: 0 })
  products_count: number;

  @OneToOne(() => Balance, (balance) => balance.shop, { onDelete: "CASCADE" })
  @JoinColumn()
  balance?: Balance;

  @OneToMany(() => Product, (product) => product.shop, { onDelete: "CASCADE" })
  products?: Product[];

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @ManyToMany(() => Attachment, { cascade: true, eager: true })
  @JoinTable({
    name: 'shop_cover_image',
    joinColumn: { name: 'shopId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
  })
  cover_image?: Attachment[];

  @ManyToOne(() => Attachment, { nullable: true, eager: true })
  @JoinColumn()
  logo?: Attachment;

  @ManyToOne(() => UserAdd, { nullable: true })
  @JoinColumn()
  address?: UserAdd;

  @OneToOne(() => ShopSettings, { cascade: true, nullable: true })
  @JoinColumn()
  settings?: ShopSettings;

  @Column({ nullable: true })
  gst_number?: string;

  @OneToMany(() => Category, (category) => category.shop, { onDelete: "CASCADE" })
  categories: Category[];

  @OneToMany(() => SubCategory, (subCategory) => subCategory.shop, { onDelete: "CASCADE" })
  subCategories: SubCategory[];

  @ManyToMany(() => Order, (order) => order.shop, { nullable: true, onDelete: "CASCADE" })
  orders: Order[];

  @ManyToOne(() => Permission, (permission) => permission.shop, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: 'permission_id' })
  permission?: Permission;

  @ManyToMany(() => Permission, (permission) => permission.shops, { onDelete: "CASCADE", eager: true })
  @JoinTable({ name: 'shop_additional_permission' })
  additionalPermissions: Permission[];

  @Column({ type: 'int', default: 0 })
  dealerCount: number;

  @OneToMany(() => Event, (event) => event.shop, { onDelete: "CASCADE" })
  events: Event[];

  @ManyToMany(() => Region, (region) => region.shops, { onDelete: "CASCADE", eager: true })
  regions: Region[];
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
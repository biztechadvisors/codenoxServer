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
import { Category, SubCategory } from 'src/categories/entities/category.entity'
import { Product } from 'src/products/entities/product.entity'
import { Order } from 'src/orders/entities/order.entity'
import { Setting } from 'src/settings/entities/setting.entity'
import { Permission } from 'src/permission/entities/permission.entity'
import { Region } from '@db/src/region/entities/region.entity'
import { Event } from '@db/src/events/entities/event.entity'

@Entity()
export class Shop extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @ManyToOne(() => User, (user) => user.owned_shops)
  owner: User;

  @OneToMany(() => User, (user) => user.managed_shop)
  staffs?: User[];

  @Column()
  is_active: boolean;

  @Column()
  orders_count: number;

  @Column()
  products_count: number;

  @OneToOne(() => Balance, (balance) => balance.shop, { cascade: true })
  @JoinColumn()
  balance?: Balance;

  @OneToMany(() => Product, (product) => product.shop)
  product?: Product[];

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description?: string;

  // @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  // @JoinColumn()
  // cover_image: Attachment;

  @ManyToMany(() => Attachment, { cascade: true, eager: true, nullable: true })
  @JoinTable({
    name: 'shop_cover_image',
    joinColumn: { name: 'shopId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
  })
  cover_image?: Attachment[];

  @ManyToOne(() => Attachment, { cascade: true, eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  logo?: Attachment;

  @ManyToOne(() => UserAddress, { cascade: true })
  @JoinColumn()
  address: UserAddress;

  @OneToOne(() => ShopSettings, { cascade: true })
  @JoinColumn()
  settings?: ShopSettings;

  @Column()
  gst_number: string;

  @OneToMany(() => Category, (category) => category.shop)
  category: Category[];

  @OneToMany(() => SubCategory, subCategory => subCategory.shop)
  subCategories: SubCategory[];

  @ManyToMany(() => Order, (order) => order.shop, { cascade: true, nullable: true })
  @JoinTable({ name: "shop_order" })
  order: Order[];

  @ManyToOne(() => Permission, permission => permission.shop)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @ManyToMany(() => Permission, (permission) => permission.shops, { cascade: true })
  @JoinTable({ name: 'shop_permission' })
  additionalPermissions: Permission[];

  @Column({ nullable: true })
  dealerCount: number;

  @OneToMany(() => Event, (event) => event.shop)
  events: Event[];

  @OneToMany(() => Region, (region) => region.shop, { nullable: true })
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
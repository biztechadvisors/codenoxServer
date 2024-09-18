/* eslint-disable prettier/prettier */

import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from './profile.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { Dealer } from './dealer.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { InventoryStocks, Stocks } from 'src/stocks/entities/stocks.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Notification } from 'src/notifications/entities/notifications.entity';
import { Add } from '@db/src/address/entities/address.entity';

export enum UserType {
  Super_Admin = 'Super_Admin',
  Admin = 'Admin',
  Dealer = 'Dealer',
  Vendor = 'Vendor',
  Company = 'Company',
  Customer = 'Customer',
  Owner = 'Owner',
  Staff = 'Staff'
}

@Entity()
export class User extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  otp: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  shop_id?: number;

  @OneToOne(() => Profile, profile => profile.customer, { onDelete: 'CASCADE' })
  @JoinColumn()
  profile?: Profile;

  @OneToOne(() => Dealer, (dealer) => dealer.user, { onDelete: 'CASCADE' })
  @JoinColumn()
  dealer?: Dealer;

  @ManyToOne(() => User, (user) => user.createdUsers, {
    onDelete: 'CASCADE',
  })
  createdBy?: User;

  @OneToMany(() => User, (user) => user.createdBy, { onDelete: "SET NULL" })
  createdUsers?: User[];

  @OneToMany(() => Shop, shop => shop.owner, { onDelete: "SET NULL" })
  owned_shops?: Shop[];

  @OneToMany(() => Notification, (notification) => notification.user, { onDelete: "CASCADE" })
  notifications: Notification[];

  @ManyToOne(() => Shop, shop => shop.staffs, {
    onDelete: 'CASCADE',
    cascade: true,
    nullable: true,
  })
  @JoinColumn({ name: 'shop_id' })
  managed_shop?: Shop;

  @OneToMany(() => InventoryStocks, inventoryStocks => inventoryStocks.user)
  inventoryStocks?: InventoryStocks[];

  @OneToMany(() => Stocks, stocks => stocks.user, { onDelete: "CASCADE" })
  stocks?: Stocks[];

  @Column({ default: true })
  is_active?: boolean;

  @OneToMany(() => Add, add => add.customer, { onDelete: "CASCADE", eager: true })
  address?: Add[];

  @OneToMany(() => Order, order => order.customer, { onDelete: "CASCADE" })
  orders: Order[];

  @OneToMany(() => StocksSellOrd, stocksSellOrd => stocksSellOrd.soldBy, { onDelete: "CASCADE" })
  stockOrd: StocksSellOrd[];

  @OneToMany(() => StocksSellOrd, stocksSellOrd => stocksSellOrd.customer, { onDelete: "CASCADE" })
  stocksSellOrd: StocksSellOrd[];

  @ManyToOne(() => Permission, {
    onDelete: 'CASCADE',
    nullable: true,
    eager: true
  })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ nullable: true })
  walletPoints: number;

  @Column('varchar', { length: 200, nullable: true })
  contact: string;

  @Column('datetime', { nullable: true })
  email_verified_at: Date;
}

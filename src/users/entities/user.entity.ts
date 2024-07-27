/* eslint-disable prettier/prettier */
import { Address } from 'src/addresses/entities/address.entity';
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

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password?: string;

  @Column()
  otp: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  shop_id?: number;

  @OneToOne(() => Profile, profile => profile.customer, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  profile?: Profile;

  @OneToOne(() => Dealer, dealer => dealer.user, { cascade: ['insert', 'update'] })
  @JoinColumn()
  dealer?: Dealer;

  @ManyToOne(() => User, user => user.createdUsers)
  createdBy?: User;

  @OneToMany(() => User, user => user.createdBy)
  createdUsers?: User[];

  @OneToMany(() => Shop, shop => shop.owner)
  owned_shops?: Shop[];

  @OneToMany(() => Notification, notifications => notifications.user)
  notifications?: Notification[];

  @ManyToOne(() => Shop, shop => shop.staffs, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'shop_id' })
  managed_shop?: Shop;

  @OneToMany(() => InventoryStocks, inventoryStocks => inventoryStocks.user)
  inventoryStocks?: InventoryStocks[];

  @OneToMany(() => Stocks, stocks => stocks.user)
  stocks?: Stocks[];

  @Column({ default: true })
  is_active?: boolean;

  @OneToMany(() => Address, address => address.customer, { cascade: true })
  address?: Address[];

  @OneToMany(() => Order, order => order.customer)
  orders: Order[];

  @ManyToOne(() => StocksSellOrd, (stocksSellOrd) => stocksSellOrd.soldBy)
  stockOrd: User;

  @OneToMany(() => StocksSellOrd, stocksSellOrd => stocksSellOrd.customer)
  stocksSellOrd: StocksSellOrd[];

  @ManyToOne(() => Permission, permission => permission.user)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column()
  walletPoints: number;

  @Column('varchar', { length: 200, nullable: true })
  contact: string;

  @Column('datetime', { nullable: true })
  email_verified_at: Date;
}

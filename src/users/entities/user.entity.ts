/* eslint-disable prettier/prettier */
import { Address } from 'src/addresses/entities/address.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from './profile.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { Dealer } from './dealer.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Stocks } from 'src/stocks/entities/stocks.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';

export enum UserType {
  Super_Admin = 'Super_Admin',
  Admin = 'Admin',
  Dealer = 'Dealer',
  Vendor = 'Vendor',
  Customer = 'Customer',
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

  @OneToOne(() => Profile, (profile) => profile.customer)
  @JoinColumn()
  profile?: Profile;

  @OneToOne(() => Dealer, (dealer) => dealer)
  @JoinColumn()
  dealer?: Dealer;

  @ManyToOne(() => User, (user) => user)
  UsrBy?: User;

  @OneToMany(() => Shop, (shop) => shop.owner)
  shops?: Shop[];

  @OneToMany(() => Stocks, (stocks) => stocks.user, { cascade: true, eager: true })
  stocks?: Stocks[];

  @ManyToOne(() => Shop, (shop) => shop.staffs)
  managed_shop?: Shop;

  @Column()
  is_active?: boolean = true;

  @OneToMany(() => Address, (address) => address.customer, { cascade: true })
  address?: Address[];

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => StocksSellOrd, (stocksSellOrd) => stocksSellOrd.customer)
  stocksSellOrd: StocksSellOrd[];

  @ManyToOne(() => Permission)
  @JoinColumn({ name: "permission_id" })
  type?: Permission;


  @Column()
  walletPoints: number;

  @Column('varchar', { length: 200, nullable: true })
  contact: string;
  @Column('datetime', { nullable: true })
  email_verified_at: Date;
}
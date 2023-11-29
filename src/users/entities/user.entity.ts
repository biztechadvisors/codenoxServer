/* eslint-disable prettier/prettier */
import { Address } from 'src/addresses/entities/address.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from './profile.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column()
  shop_id?: number;

  @OneToOne(() => Profile, (profile) => profile.customer)
  @JoinColumn()
  profile?: Profile;

  @OneToMany(() => Shop, (shop) => shop.owner, { cascade: true })
  shops?: Shop[];

    @ManyToOne(() => Shop, (shop) => shop.staffs)
    managed_shop?: Shop;

  @Column()
  is_active?: boolean = true;

  @OneToMany(() => Address, (address) => address.customer)
  address?: Address[];

  @OneToMany(() => Order, (order) => order.customer)
  @JoinColumn()
  orders: Order[];

  // @Column({ type: 'timestamp' })
  // createdAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

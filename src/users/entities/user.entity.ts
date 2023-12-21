/* eslint-disable prettier/prettier */
import { Address } from 'src/addresses/entities/address.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
// import { Attachment } from 'src/common/entities/attachment.entity';
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
} from 'typeorm';

export enum UserType {
    Admin = 'Admin',
    Dealer = 'Dealer',
    Vendar = 'Vendar',
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

<<<<<<< HEAD
    @Column({ nullable: true })
    shop_id?: number;
=======
  @Column()
  shop_id?: number;
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

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

<<<<<<< HEAD
    @Column()
    permission: string;

    @OneToMany(() => Order, (order) => order.customer)
    @JoinColumn()
    orders: Order[];

    @Column({ type: 'timestamp' })
    createdAt: Date;

    @Column()
    type: UserType;

    @Column()
    walletPoints: number;
}
=======
  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @Column({ type: 'timestamp' })
  createdAt: Date;
}
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

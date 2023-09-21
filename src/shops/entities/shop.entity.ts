import { UserAddress } from 'src/addresses/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { Balance } from './balance.entity';
import { ShopSettings } from './shopSettings.entity';

@Entity()
export class Shop extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  owner_id: number;
  @ManyToOne(() => User, (user) => user.shops)
  owner: User;
  @OneToMany(() => User, user => user.managed_shop)
  staffs?: User[];
  @Column()
  is_active: boolean;
  @Column()
  orders_count: number;
  @Column()
  products_count: number;
  @OneToOne(() => Balance)
  balance?: Balance;
  @Column()
  name: string;
  @Column()
  slug: string;
  @Column()
  description?: string;
  @OneToOne(() => Attachment)
  cover_image: Attachment;
  @OneToOne(() => Attachment)
  logo?: Attachment;
  @OneToOne(() => UserAddress)
  address: UserAddress;
  @OneToOne(() => ShopSettings)
  settings?: ShopSettings;
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


import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

@Entity()
export class UserAddress {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  street_address: string;
  @Column()
  country: string;
  @Column()
  city: string;
  @Column()
  state: string;
  @Column()
  zip: string;
}

@Entity()
export class Address extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  default: boolean;
  @ManyToMany(() => UserAddress, { cascade: true })
  address: UserAddress;
  @Column()
  type: AddressType;
  @ManyToOne(() => User, user => user.address)
  customer: User;
}

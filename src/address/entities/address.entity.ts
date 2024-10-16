import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
  SHOP = 'shop', // Consistent casing for enum values
}

@Entity()
export class UserAdd extends CoreEntity {
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

  @Column({ nullable: true })
  customer_id: number;

}

@Entity('add')
export class Add {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.SHIPPING,
  })
  type: AddressType;

  @Column({ default: false })
  default: boolean;

  @ManyToOne(() => User, (user) => user.adds)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @OneToOne(() => UserAdd, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'address_id' })
  address: UserAdd;
}


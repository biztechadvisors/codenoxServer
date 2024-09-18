import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

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

@Entity()
export class Add extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: true })
  default: boolean;

  @ManyToOne(() => UserAdd, { onDelete: "CASCADE", onUpdate: "CASCADE", eager: true })
  @JoinColumn()
  address: UserAdd;

  @Column({
    type: 'enum',
    enum: AddressType,
  })
  type: AddressType;

  @ManyToOne(() => User, (user) => user.address, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  customer: User;
}

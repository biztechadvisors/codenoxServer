/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wishlist extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: string;

  @ManyToMany(() => User)
  @JoinTable()
  user: User[];

  @ManyToOne(() => Product, (product) => product.in_wishlist)
  product: Product

  // @ManyToOne(() => User)
  // user: User[]
  @Column('datetime')
  created_at: Date

  @Column('datetime')
  updated_at: Date
}

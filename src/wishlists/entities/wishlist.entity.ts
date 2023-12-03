import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wishlist extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => Product)
  @JoinColumn()
  product: Product;
  @Column()
  product_id: string;
  @ManyToMany(() => User)
  @JoinTable()
  user: User[];
  @Column()
  user_id: string;
}

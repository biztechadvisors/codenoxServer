import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wishlist extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => Product)
  product: Product;
  @Column()
  product_id: string;
  @ManyToMany(() => User)
  user: User[];
  @Column()
  user_id: string;
}

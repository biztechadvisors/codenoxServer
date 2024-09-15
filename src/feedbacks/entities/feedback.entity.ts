import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Shop } from 'src/shops/entities/shop.entity';

@Entity()
export class Feedback extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  model_type: string;

  @Column()
  model_id: number;

  @Column({ nullable: true })
  positive?: boolean;

  @Column({ nullable: true })
  negative?: boolean;

  @ManyToOne(() => Shop, { cascade: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;
}

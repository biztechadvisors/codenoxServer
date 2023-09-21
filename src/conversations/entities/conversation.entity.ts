import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LatestMessage extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  body: string;
  @Column()
  conversation_id: string;
  @Column()
  user_id: string;
}

@Entity()
export class Conversation extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  shop_id: number;
  @Column()
  unseen: boolean;
  @Column()
  user_id: string;
  @OneToOne(() => User)
  user: User;
  @OneToOne(() => Shop)
  shop: Shop;
  @OneToOne(() => LatestMessage)
  latest_message: LatestMessage;
}

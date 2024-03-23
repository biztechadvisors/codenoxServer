/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LatestMessage extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  body: string;
  @Column()
  conversation_id: number;
  @Column()
  user_id: number;
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
  @ManyToOne(() => User)
  user: User;
  @ManyToOne(() => Shop)
  shop: Shop;
  @ManyToOne(() => Dealer)
  dealer: Dealer;
  @Column()
  dealer_id: number;
  @ManyToOne(() => LatestMessage)
  latest_message: LatestMessage;
}
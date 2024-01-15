/* eslint-disable prettier/prettier */
import { PickType } from '@nestjs/swagger';
import { Conversation, LatestMessage } from '../entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';

export class CreateConversationDto extends PickType(Conversation, [
  'shop_id',
  'unseen',
  'user_id'
]) {
  latest_message: LatestMessage
  user: User
  shop: Shop
}
/* eslint-disable prettier/prettier */
import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Conversation } from '../entities/conversation.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Dealer } from 'src/users/entities/dealer.entity';

export class ConversationPaginator extends Paginator<Conversation> {
  data: Conversation[];
}

export class GetConversationsDto extends PaginationArgs {
  orderBy?: string;
  sortedBy?: SortOrder;
  search?: string;
  language?: string;
  shop?: Shop;
  dealer?: Dealer;
}
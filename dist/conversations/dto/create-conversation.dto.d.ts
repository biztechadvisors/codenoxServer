import { Conversation, LatestMessage } from '../entities/conversation.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
declare const CreateConversationDto_base: import("@nestjs/common").Type<Pick<Conversation, "shop_id" | "user_id" | "unseen">>;
export declare class CreateConversationDto extends CreateConversationDto_base {
    latest_message: LatestMessage;
    user: User;
    shop: Shop;
}
export {};

import { CoreEntity } from 'src/common/entities/core.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
export declare class LatestMessage extends CoreEntity {
    id: number;
    body: string;
    conversation_id: number;
    user_id: number;
}
export declare class Conversation extends CoreEntity {
    id: number;
    shop_id: number;
    unseen: boolean;
    user_id: string;
    user: User;
    shop: Shop;
    latest_message: LatestMessage;
}

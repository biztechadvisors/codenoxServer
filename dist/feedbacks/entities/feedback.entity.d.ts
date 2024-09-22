import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
export declare class Feedback extends CoreEntity {
    id: number;
    user: User;
    model_type: string;
    model_id: number;
    positive?: boolean;
    negative?: boolean;
    shop: Shop;
}

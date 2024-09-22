import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Report } from './reports.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
export declare class Review extends CoreEntity {
    id: number;
    rating: number;
    name: string;
    comment: string;
    shop: Shop;
    order: Order;
    photos: Attachment[];
    user: User;
    product: Product;
    feedbacks: Feedback[];
    my_feedback: Feedback;
    positive_feedbacks_count: number;
    negative_feedbacks_count: number;
    abusive_reports: Report[];
    variation_option_id?: string;
    abusive_reports_count?: number;
}

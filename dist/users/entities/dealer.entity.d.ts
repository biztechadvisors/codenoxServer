import { Product } from '../../products/entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { User } from './user.entity';
import { Balance } from 'src/shops/entities/balance.entity';
export declare enum SubscriptionType {
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}
export declare class Dealer {
    id: number;
    user: User;
    phone: number;
    name: string;
    subscriptionType: SubscriptionType;
    subscriptionStart: Date;
    subscriptionEnd: Date;
    discount: number;
    walletBalance: number;
    isActive: boolean;
    dealerProductMargins: DealerProductMargin[];
    dealerCategoryMargins: DealerCategoryMargin[];
    balance: Balance[];
    gst: string;
    pan: string;
}
export declare class DealerProductMargin {
    id: number;
    dealer: Dealer;
    product: Product;
    margin: number;
    isActive: boolean;
}
export declare class DealerCategoryMargin {
    id: number;
    dealer: Dealer;
    category: Category;
    margin: number;
    isActive: boolean;
}

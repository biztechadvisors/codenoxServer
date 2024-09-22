import { Product } from "src/products/entities/product.entity";
import { SubscriptionType } from "../entities/dealer.entity";
import { User } from "../entities/user.entity";
import { Category } from "src/categories/entities/category.entity";
export declare class DealerProductMarginDto {
    id: number;
    dealer: number;
    product: Product;
    margin: number;
    isActive: boolean;
}
export declare class DealerCategoryMarginDto {
    id: number;
    dealer: number;
    category: Category;
    margin: number;
    isActive: boolean;
}
export declare class DealerDto {
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
    dealerProductMargins: DealerProductMarginDto[];
    dealerCategoryMargins: DealerCategoryMarginDto[];
    gst: string;
    pan: string;
}

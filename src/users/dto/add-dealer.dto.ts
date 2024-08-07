/* eslint-disable prettier/prettier */
import { Product } from "src/products/entities/product.entity";
import { SubscriptionType } from "../entities/dealer.entity";
import { User } from "../entities/user.entity";
import { Category } from "src/categories/entities/category.entity";

export class DealerProductMarginDto {
    id: number;
    dealer: number;
    product: Product;
    margin: number;
    isActive: boolean;
}

export class DealerCategoryMarginDto {
    id: number;
    dealer: number;
    category: Category;
    margin: number;
    isActive: boolean;
}

export class DealerDto {
    id: number;
    user: User; // Assuming this is properly defined elsewhere
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
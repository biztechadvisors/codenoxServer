import { Shop } from '@db/src/shops/entities/shop.entity';
export declare class Contact {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    location?: string;
    subject: string;
    message: string;
    shop: Shop;
}

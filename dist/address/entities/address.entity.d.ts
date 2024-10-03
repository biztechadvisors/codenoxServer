import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
export declare enum AddressType {
    BILLING = "billing",
    SHIPPING = "shipping",
    SHOP = "shop"
}
export declare class UserAdd extends CoreEntity {
    id: number;
    street_address: string;
    country: string;
    city: string;
    state: string;
    zip: string;
    customer_id: number;
}
export declare class Add {
    id: number;
    title: string;
    type: string;
    default: boolean;
    customer: User;
    address: UserAdd;
}

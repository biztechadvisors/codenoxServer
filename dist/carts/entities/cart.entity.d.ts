import { CoreEntity } from 'src/common/entities/core.entity';
export declare class Cart extends CoreEntity {
    id: number;
    customerId: number;
    email: string;
    phone: string;
    cartData: string;
    cartQuantity: number;
    created_at: Date;
    updated_at: Date;
}

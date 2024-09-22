import { Cart } from '../entities/cart.entity';
declare const CreateCartDto_base: import("@nestjs/common").Type<Pick<Cart, "created_at" | "updated_at" | "phone" | "email" | "customerId" | "cartData" | "cartQuantity">>;
export declare class CreateCartDto extends CreateCartDto_base {
    customerId: number;
    email: string;
    phone: string;
    cartData: string;
    cartQuantity: number;
    created_at: Date;
    updated_at: Date;
}
export {};

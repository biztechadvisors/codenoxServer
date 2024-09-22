import { AbandonedCartService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { GetCartData } from './dto/get-cart.dto';
import { ClearCartDto } from './dto/delete-cart.dto';
export declare class AbandonedCartController {
    private readonly abandonedCartService;
    constructor(abandonedCartService: AbandonedCartService);
    create(createCartDto: CreateCartDto): Promise<import("./entities/cart.entity").Cart>;
    getAbandonedCartCount(param: GetCartData): Promise<{
        products: any[];
        totalCount: number;
    }>;
    removeProductFromCart(itemId: string, query: {
        quantity?: number;
        email?: string;
    }): Promise<{
        message: string;
        status: boolean;
    }>;
    clearCart(clearCartDto: ClearCartDto): Promise<{
        success: boolean;
        message: string;
    }>;
}

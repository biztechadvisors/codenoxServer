import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateStocksDto {
    products: any[];
    ordPendQuant: number;
    dispatchedQuantity: number;
    status: boolean;
    quantity: number;
    inStock: boolean;
    user_id: number;
}

export class GetStocksDto {
    products: Product[];
    quantity: number;
    ordPendQuant: number;
    dispatchedQuantity: number;
    status: boolean;
    inStock: boolean;
    user_id: number;
}

export class UpdateStkQuantityDto {
    quantity: any;
    ordPendQuant: number;
    dispatchedQuantity: number;
    inStock: boolean;
    status: boolean;
    product: number;
}
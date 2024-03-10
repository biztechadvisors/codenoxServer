import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateStocksDto {
    products: Product[];
    ordPendQuant: number;
    status: boolean;
    quantity: number;
    inStock: boolean;
    user_id: number;
}

export class GetStocksDto {
    products: Product[];
    quantity: number;
    ordPendQuant: number;
    status: boolean;
    inStock: boolean;
    user_id: number;
}

export class UpdateStkQuantityDto {
    quantity: any;
    ordPendQuant: number;
    inStock: boolean;
    status: boolean;
    product: number;
}
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateStocksDto {
    products: Product[];
    quantity: number;
    inStock: boolean;
    user_id: number;
}

export class GetStocksDto {
    products: Product[];
    quantity: number;
    inStock: boolean;
    user_id: number;
}
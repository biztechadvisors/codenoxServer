import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateStocksDto {
    product: Product;
    quantity: number;
    inStock: boolean;
    user_id: User;
}

export class GetStocksDto {
    id: number;
    product: Product;
    quantity: number;
    inStock: boolean;
    user: User;
}
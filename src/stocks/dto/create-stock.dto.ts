import { Product } from 'src/products/entities/product.entity';

export class CreateStocksDto {
    product: Product;
    quantity: number;
    inStock: boolean;
    margine: number;
}

export class GetStocksDto {
    id: number;
    product: Product;
    quantity: number;
    inStock: boolean;
    margine: number;
}

import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

// In CreateStocksDto
export class CreateStocksDto {
    products: any[];
    ordPendQuant: number;
    orderedQuantity: number;
    dispatchedQuantity: number;
    quantity: number;
    user_id: number;
    order_id: number;
}

export class GetStocksDto {
    products: Product[];
    quantity: number;
    ordPendQuant: number;
    dispatchedQuantity: number;
    user_id: number;
    order_id: number;
}

export class UpdateStkQuantityDto {
    order_id: number;
    product_id: number;
    updateDispatchQuant: number;
}
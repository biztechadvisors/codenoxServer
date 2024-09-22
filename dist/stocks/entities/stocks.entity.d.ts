import { Order } from "src/orders/entities/order.entity";
import { Product, Variation } from "src/products/entities/product.entity";
import { User } from "src/users/entities/user.entity";
export declare class Stocks {
    id: number;
    orderedQuantity: number;
    ordPendQuant: number;
    dispatchedQuantity: number;
    receivedQuantity: number;
    product: Product;
    variation_options: Variation;
    user: User;
    order: Order;
}
export declare class InventoryStocks {
    id: number;
    quantity: number;
    status: boolean;
    inStock: boolean;
    variation_options: Variation[];
    product: Product;
    user: User;
}

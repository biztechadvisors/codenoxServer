import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
export declare class Wishlist extends CoreEntity {
    id: number;
    product: Product;
    product_id: number;
    user: User[];
    user_id: number;
}

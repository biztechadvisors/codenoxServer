import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
export declare class Tax extends CoreEntity {
    id: number;
    name: string;
    hsn_no: number;
    sac_no: string;
    rate: number;
    cgst: number;
    sgst: number;
    compensation_Cess: number;
    gst_Name: string;
    shop: Shop;
    products: Product[];
}

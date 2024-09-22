import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Category, SubCategory } from 'src/categories/entities/category.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Type } from 'src/types/entities/type.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Tax } from 'src/taxes/entities/tax.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Region } from '@db/src/region/entities/region.entity';
declare enum ProductStatus {
    PUBLISH = "Publish",
    DRAFT = "Draft"
}
export declare enum ProductType {
    SIMPLE = "simple",
    VARIABLE = "variable"
}
export declare class Product extends CoreEntity {
    [x: string]: any;
    id: number;
    name: string;
    slug: string;
    type_id: number;
    product_type: ProductType;
    type: Type | null;
    regions: Region[];
    categories: Category[];
    subCategories: SubCategory[];
    tags: Tag[];
    variations?: AttributeValue[];
    variation_options: Variation[];
    pivot?: OrderProductPivot[];
    orders: Order[];
    stocksSellOrders: StocksSellOrd[];
    shop: Shop;
    shop_id: number;
    related_products?: Product[];
    my_review?: Review[];
    taxes: Tax;
    gallery?: Attachment[];
    image?: Attachment;
    description: string;
    in_stock: boolean;
    is_taxable: boolean;
    sale_price?: number;
    max_price?: number;
    min_price?: number;
    sku?: string;
    status: ProductStatus;
    height?: string;
    length?: string;
    width?: string;
    price?: number;
    quantity: number;
    unit: string;
    ratings: number;
    in_wishlist: boolean;
    language?: string;
    Google_Shopping?: string;
    translated_languages?: string[];
}
export declare class OrderProductPivot extends CoreEntity {
    id: number;
    variation_option_id?: number;
    order_quantity: number;
    unit_price: number;
    subtotal: number;
    order: Order;
    product: Product;
    StocksSellOrd: StocksSellOrd;
    Ord_Id: number;
}
export declare class File extends CoreEntity {
    id: number;
    attachment_id: number;
    url: string;
    fileable_id: number;
}
export declare class Variation {
    id: number;
    title: string;
    name: string;
    slug: string;
    price: number;
    sku: string;
    is_disable: boolean;
    sale_price?: number;
    quantity: number;
    options: VariationOption[];
    image: File;
    value: string;
    meta: string;
    created_at: Date;
    updated_at: Date;
}
export declare class VariationOption {
    id: number;
    name: string;
    value: string;
}
export {};

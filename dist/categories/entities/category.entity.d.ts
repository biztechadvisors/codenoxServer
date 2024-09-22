import { Region } from '@db/src/region/entities/region.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Type } from 'src/types/entities/type.entity';
export declare class Category extends CoreEntity {
    id: number;
    name: string;
    slug: string;
    parent?: Category;
    children?: Category[];
    subCategories: SubCategory[];
    regions: Region[];
    details?: string;
    image?: Attachment;
    icon?: string;
    type: Type | null;
    products: Product[];
    shop?: Shop;
    language: string;
    translated_languages: string[];
    products_count: number;
}
export declare class SubCategory extends CoreEntity {
    id: number;
    name: string;
    slug: string;
    category: Category;
    products: Product[];
    shop: Shop;
    regions: Region[];
    details?: string;
    image?: Attachment;
    language: string;
    translated_languages: string[];
}

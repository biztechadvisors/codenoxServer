import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Region } from '@db/src/region/entities/region.entity';
export declare class TypeSettings {
    id: number;
    isHome: boolean;
    layoutType: string;
    productCard: string;
}
export declare class Type extends CoreEntity {
    id: number;
    name: string;
    slug: string;
    image: Attachment;
    icon: string;
    banners?: Banner[];
    promotional_sliders?: Attachment[];
    settings?: TypeSettings;
    products?: Product[];
    tags?: Tag[];
    categories?: Category[];
    shop?: Shop;
    regions: Region[];
    language: string;
    translated_languages: string[];
}
export declare class Banner {
    id: number;
    title?: string;
    description?: string;
    type: Type;
    image: Attachment | null;
}

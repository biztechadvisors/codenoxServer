import { Region } from '@db/src/region/entities/region.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Type } from 'src/types/entities/type.entity';
export declare class Tag extends CoreEntity {
    id: number;
    name: string;
    slug: string;
    parent: number | null;
    details: string;
    image: Attachment | null;
    icon: string;
    type: Type | null;
    regions: Region[];
    products: Product[];
    shop?: Shop;
    language: string;
    translatedLanguages: string[];
}

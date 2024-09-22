import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';
export declare class GetInspired {
    id: number;
    title: string;
    type: string;
    shop: Shop;
    images: Attachment[];
    tags?: Tag[];
}

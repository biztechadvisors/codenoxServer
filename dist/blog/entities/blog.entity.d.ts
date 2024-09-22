import { Attachment } from 'src/common/entities/attachment.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Region } from '@db/src/region/entities/region.entity';
import { Tag } from '@db/src/tags/entities/tag.entity';
export declare class Blog {
    id: number;
    title: string;
    content: string;
    date: string;
    shop: Shop;
    attachments?: Attachment[];
    region: Region;
    tags?: Tag[];
}

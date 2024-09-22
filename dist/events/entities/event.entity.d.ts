import { Shop } from 'src/shops/entities/shop.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Region } from '@db/src/region/entities/region.entity';
export declare class Event {
    id: number;
    title: string;
    eventName: string;
    description: string;
    date: string;
    time: string;
    location: string;
    collaboration: string;
    shop: Shop;
    images?: Attachment[];
    region: Region;
}

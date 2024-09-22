import { Shop } from 'src/shops/entities/shop.entity';
import { QnA } from './qna.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
export declare class FAQ {
    id: number;
    title: string;
    description: string;
    images?: Attachment[];
    shop: Shop;
    qnas: QnA[];
}

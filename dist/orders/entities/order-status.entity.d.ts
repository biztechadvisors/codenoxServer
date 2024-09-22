import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from './order.entity';
export declare class OrderStatus extends CoreEntity {
    id: number;
    name: string;
    color: string;
    serial: number;
    slug: string;
    language: string;
    translated_languages: string[];
    order: Order;
}

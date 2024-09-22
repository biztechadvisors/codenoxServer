import { CoreEntity } from 'src/common/entities/core.entity';
import { Attribute } from './attribute.entity';
export declare class AttributeValue extends CoreEntity {
    id: number;
    shop_id: number;
    value: string;
    meta?: string;
    attribute: Attribute;
    attribute_value_id: number;
}

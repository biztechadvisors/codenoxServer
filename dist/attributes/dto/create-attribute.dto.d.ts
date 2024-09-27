import { Attribute } from '../entities/attribute.entity';
import { Shop } from 'src/shops/entities/shop.entity';
declare const CreateAttributeDto_base: import("@nestjs/common").Type<Pick<Attribute, "name" | "slug" | "language" | "shop_id">>;
export declare class CreateAttributeDto extends CreateAttributeDto_base {
    values: AttributeValueDto[];
    shop: Shop;
}
export declare class AttributeValueDto {
    id: number;
    value: string;
    meta?: string;
    language?: string;
}
export {};

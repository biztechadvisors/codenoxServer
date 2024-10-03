import { Attribute } from '../entities/attribute.entity';
import { Shop } from 'src/shops/entities/shop.entity';
declare const CreateAttributeDto_base: import("@nestjs/common").Type<Pick<Attribute, "name" | "slug" | "shop_id" | "language">>;
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
export declare class AttributeResponseDto {
    id: number;
    name: string;
    slug: string;
    shop_id?: number;
    language?: string;
    values?: Array<{
        value: string;
        meta?: any;
    }>;
}
export {};

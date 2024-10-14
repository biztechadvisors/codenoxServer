import { Product } from '../entities/product.entity';
import { AttributeValue } from 'src/attributes/entities/attribute-value.entity';
import { Tax } from 'src/taxes/entities/tax.entity';
import { AttachmentDTO } from '@db/src/common/dto/attachment.dto';
declare const CreateProductDto_base: import("@nestjs/common").Type<Omit<Product, "type" | "length" | "tags" | "created_at" | "updated_at" | "id" | "slug" | "categories" | "shop" | "translated_languages" | "subCategories" | "orders" | "variation_options" | "variations" | "pivot" | "related_products" | "taxes" | "height" | "width" | "regionName">>;
export declare class CreateProductDto extends CreateProductDto_base {
    categories: number[];
    subCategories: number[];
    tags: number[];
    type_id: number;
    shop_id: number;
    taxes: Tax;
    variations: AttributeValue[];
    variation_options: {
        [x: string]: any;
        delete: any;
        upsert: VariationDto[];
    };
    related_products: Product[];
    translated_languages: string[];
    regionName: string[];
}
export declare class VariationDto {
    is_digital: boolean;
    sku: string;
    name: string;
    quantity: number;
    sale_price: number;
    price: number;
    is_disable: boolean;
    title: string;
    image: AttachmentDTO;
    options: VariationOptionDto[];
    id: any;
}
export declare class VariationOptionDto {
    id: number;
    name: string;
    value: string;
}
export {};

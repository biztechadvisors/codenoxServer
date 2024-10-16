import { Manufacturer } from '../entities/manufacturer.entity';
declare const CreateManufacturerDto_base: import("@nestjs/common").Type<Omit<Manufacturer, "id" | "name" | "slug" | "type_id" | "type" | "image" | "description" | "translated_languages" | "products_count" | "cover_image" | "socials" | "website">>;
export declare class CreateManufacturerDto extends CreateManufacturerDto_base {
    shop_id?: string;
}
export {};

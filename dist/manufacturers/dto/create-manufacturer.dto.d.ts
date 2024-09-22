import { Manufacturer } from '../entities/manufacturer.entity';
declare const CreateManufacturerDto_base: import("@nestjs/common").Type<Omit<Manufacturer, "id" | "name" | "slug" | "image" | "type" | "translated_languages" | "description" | "products_count" | "socials" | "website" | "cover_image" | "type_id">>;
export declare class CreateManufacturerDto extends CreateManufacturerDto_base {
    shop_id?: string;
}
export {};

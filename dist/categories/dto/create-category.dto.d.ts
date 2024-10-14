import { Category } from '../entities/category.entity';
declare const CreateCategoryDto_base: import("@nestjs/common").Type<Pick<Category, "type" | "name" | "image" | "icon" | "language" | "parent" | "details">>;
export declare class CreateCategoryDto extends CreateCategoryDto_base {
    shop_id: number;
    type_id: number;
    image_id?: number;
    region_name: string[];
}
export declare class CreateSubCategoryDto {
    name: string;
    category_id: number;
    details?: string;
    image?: {
        id: number;
    };
    language: string;
    shop_id: number;
    regionName: string[];
}
export {};

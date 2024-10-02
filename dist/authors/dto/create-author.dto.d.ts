import { Author } from '../entities/author.entity';
declare const CreateAuthorDto_base: import("@nestjs/common").Type<Pick<Author, "id" | "name" | "slug" | "image" | "language" | "translated_languages" | "products_count" | "cover_image" | "bio" | "socials" | "born" | "death" | "is_approved" | "languages" | "quote">>;
export declare class CreateAuthorDto extends CreateAuthorDto_base {
    shop_id?: string;
}
export {};

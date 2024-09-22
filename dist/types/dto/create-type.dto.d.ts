import { AttachmentDTO } from 'src/common/dto/attachment.dto';
export declare class BannerDto {
    id: number;
    title?: string;
    description?: string;
    image: AttachmentDTO;
}
export declare class TypeSettingsDto {
    isHome: boolean;
    productCard: string;
    layoutType: string;
}
export declare class CreateTypeDto {
    language: string;
    name: string;
    shop_id: number;
    icon: string;
    slug: string;
    settings: TypeSettingsDto;
    promotional_sliders: AttachmentDTO[];
    banners: BannerDto[];
    translated_languages: string[];
    region_name: string[];
}

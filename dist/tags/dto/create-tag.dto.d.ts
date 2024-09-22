export declare class CreateTagDto {
    name: string;
    icon: string;
    details: string;
    language: string;
    translatedLanguages: string[];
    shopSlug: string;
    image?: {
        id: number;
    };
    type_id?: number;
    parent?: number;
    region_name: string[];
}

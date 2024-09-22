import { CreateQnADto } from './createqnadto.dto';
export declare class CreateFAQDto {
    title: string;
    description: string;
    shop_id: number;
    imageIds?: number[];
    qnas?: CreateQnADto[];
}
export declare class UpdateFAQDto {
    title?: string;
    description?: string;
    shop_id: number;
    imageIds?: number[];
    qnas?: CreateQnADto[];
}

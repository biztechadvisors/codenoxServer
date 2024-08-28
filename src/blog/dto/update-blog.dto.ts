import { IsOptional, IsString, IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateBlogDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsInt()
    shopId?: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    attachmentIds?: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    tagIds?: number[]; // Include tagIds for updating tags

    @IsNotEmpty()
    @IsString()
    regionName: string;
}
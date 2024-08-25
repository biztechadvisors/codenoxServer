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

    @IsNotEmpty()
    @IsString()
    regionName: string;
}

import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateBlogDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsInt()
    shopId: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    attachmentIds?: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    tagIds?: number[]; // Include tagIds for associating tags

    @IsNotEmpty()
    @IsString()
    regionName: string;
}
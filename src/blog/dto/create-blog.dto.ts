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

    @IsNotEmpty()
    @IsString()
    regionName: string;  // Added regionName to DTO
}

import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';

export class UpdateEventDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    eventName?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsString()
    time?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    collaboration?: string;

    @IsOptional()
    @IsInt()
    shopId?: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    imageIds?: number[];
}

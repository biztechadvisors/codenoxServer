import { IsNotEmpty, IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    eventName: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    date: string;

    @IsNotEmpty()
    @IsString()
    time: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsString()
    collaboration: string;

    @IsNotEmpty()
    @IsInt()
    shopId: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    imageIds?: number[];

    @IsNotEmpty()
    @IsString()
    regionName: string;  // Added regionName to DTO
}

// src/get-inspired/dto/create-get-inspired.dto.ts
import { IsNotEmpty, IsOptional, IsArray, IsNumber, IsString } from 'class-validator';

export class CreateGetInspiredDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsNumber()
    shopId: number;

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    imageIds?: number[];

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    tagIds?: number[];
}

export class UpdateGetInspiredDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    imageIds?: number[];

    @IsArray()
    @IsOptional()
    @IsNumber({}, { each: true })
    tagIds?: number[];
}

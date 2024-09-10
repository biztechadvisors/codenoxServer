import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayUnique, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRegionDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNumber()
    shop_id: number; // Array of shop IDs
}

export class UpdateRegionDto extends PartialType(CreateRegionDto) { }

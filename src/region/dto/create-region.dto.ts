import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRegionDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @ArrayUnique()
    shop?: number[];  // Now an array of shop IDs
}

export class UpdateRegionDto extends PartialType(CreateRegionDto) { }

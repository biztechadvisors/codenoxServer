import { IsNotEmpty, IsOptional, IsString, IsArray, ArrayUnique, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRegionDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsArray()
    @ArrayUnique()
    @IsNumber({}, { each: true })
    shop: number[]; // Array of shop IDs
}

export class UpdateRegionDto extends PartialType(CreateRegionDto) { }

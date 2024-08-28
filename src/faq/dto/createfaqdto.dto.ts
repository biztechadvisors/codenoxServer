import { IsNotEmpty, IsOptional, IsArray, IsNumber, IsString, IsEnum } from 'class-validator';
import { CreateQnADto } from './createqnadto.dto';


export class CreateFAQDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    shopId: number;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    imageIds?: number[];

    @IsOptional()
    @IsArray()
    qnas?: CreateQnADto[];
}

export class UpdateFAQDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    shopId?: number;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    imageIds?: number[];

    @IsOptional()
    @IsArray()
    qnas?: CreateQnADto[];
}

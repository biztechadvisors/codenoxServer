import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateVacancyDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    employmentType: string;

    @IsNotEmpty()
    salaryRange: string;

    @IsNotEmpty()
    @IsNumber()
    locationId: number;

    @IsNotEmpty()
    @IsNumber()
    shopId: number;

    @IsOptional()
    @IsNumber()
    careerId?: number; // Optional
}

export class UpdateVacancyDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    employmentType?: string;

    @IsOptional()
    salaryRange?: string;

    @IsOptional()
    @IsNumber()
    locationId?: number;

    @IsOptional()
    @IsNumber()
    shopId?: number;

    @IsOptional()
    @IsNumber()
    careerId?: number; // Optional
}

export class FindVacanciesDto {
    @IsOptional()
    @IsString()
    city?: string; // Add city as an optional parameter

    @IsOptional()
    @IsNumber()
    page?: number;

    @IsOptional()
    @IsNumber()
    limit?: number;
}
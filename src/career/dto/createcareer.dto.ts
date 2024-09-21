import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateCareerDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    position: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsOptional()
    @IsString()
    cv_resume?: string;

    @IsNotEmpty()
    @IsString()
    shopSlug: string;

    @IsNotEmpty()
    @IsNumber()
    locationId: number;

    @IsNotEmpty()
    @IsNumber()
    vacancyId: number;
}

export class UpdateCareerDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    cv_resume?: string;

    @IsOptional()
    @IsString()
    shopSlug?: string;
}

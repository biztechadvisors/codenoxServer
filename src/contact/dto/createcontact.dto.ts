import { IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';

export class CreateContactDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsNotEmpty()
    @IsString()
    subject: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsOptional()
    @IsString()
    file?: string; // Path to the uploaded file

    @IsNotEmpty()
    @IsInt()
    shopId: number; // Shop ID for the relation
}

export class UpdateContactDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    subject?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsString()
    file?: string; // Path to the uploaded file

    @IsOptional()
    @IsInt()
    shopId?: number; // Shop ID for the relation
}

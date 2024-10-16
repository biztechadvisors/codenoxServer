// src/dealer-enquiry/dto/create-dealer-enquiry.dto.ts
import { IsNotEmpty, IsEmail, IsString, IsNumber } from 'class-validator';

export class CreateDealerEnquiryDto {
    @IsNotEmpty()
    firstname: string;

    @IsNotEmpty()
    lastname: string;

    @IsNotEmpty()
    phone: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    purposeofInquiry: string;

    @IsNotEmpty()
    location: string;

    @IsNotEmpty()
    businessName: string;

    @IsNotEmpty()
    businessType: string;

    @IsNotEmpty()
    Message: string;

    @IsNotEmpty()
    shopSlug: string; // Assuming you want to use shopSlug to link to the shop
}

export class UpdateDealerEnquiryDto {
    @IsNotEmpty()
    firstname?: string;

    @IsNotEmpty()
    lastname?: string;

    @IsNotEmpty()
    phone?: string;

    @IsEmail()
    email?: string;

    @IsNotEmpty()
    purposeofInquiry?: string;

    @IsNotEmpty()
    location?: string;

    @IsNotEmpty()
    businessName?: string;

    @IsNotEmpty()
    businessType?: string;

    @IsNotEmpty()
    Message?: string;
}
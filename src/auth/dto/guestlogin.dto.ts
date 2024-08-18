import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class GuestLoginDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsPhoneNumber(null)
    phoneNumber?: string;
}

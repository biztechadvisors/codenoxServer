import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';
declare const RegisterDto_base: import("@nestjs/common").Type<Pick<User, "name" | "contact" | "permission" | "email" | "password" | "createdBy">>;
export declare class RegisterDto extends RegisterDto_base {
    permission: Permission;
    isVerified: boolean;
}
declare const LoginDto_base: import("@nestjs/common").Type<Partial<Pick<User, "id" | "contact" | "email" | "password">>>;
export declare class LoginDto extends LoginDto_base {
}
export declare class SocialLoginDto {
    provider: string;
    access_token: string;
}
export declare class ChangePasswordDto {
    email?: string;
    phone_number?: string;
    oldPassword: string;
    newPassword: string;
}
export declare class ForgetPasswordDto {
    email?: string;
    phone_number?: string;
}
export declare class VerifyForgetPasswordDto {
    email?: string;
    phone_number?: string;
    token: string;
}
export declare class ResetPasswordDto {
    email?: string;
    phone_number?: string;
    token: string;
    password: string;
}
export declare class ResendOtpDto {
    email?: string;
    phone_number?: string;
}
export interface PermissionItem {
    type: string;
    read: boolean;
    write: boolean;
}
export declare class AuthResponse {
    token: string;
    refreshToken: string;
    permissions: any[];
    type_name?: string[];
    success?: boolean;
    message?: string;
}
export declare class CoreResponse extends CoreMutationOutput {
}
export declare class VerifyOtpDto {
    otp_id: string;
    code: number;
    phone_number: string;
    email: string;
}
export declare class OtpResponse {
    id: string;
    message: string;
    success: boolean;
    phone_number: string;
    provider: string;
    is_contact_exist: boolean;
}
export declare class OtpDto {
    phone_number: string;
}
export declare class UpdateOtpDto {
    otp: number;
}
export declare class OtpLoginDto {
    otp_id: string;
    code: string;
    phone_number: string;
    name?: string;
    email?: string;
}
export declare class GetUserArgs {
    id: number;
    text: string;
    first: number;
    page: number;
}
export {};

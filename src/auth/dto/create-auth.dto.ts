/* eslint-disable prettier/prettier */
import { PartialType, PickType } from '@nestjs/swagger';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/users/entities/user.entity';

// enum Permission {
//   SUPER_ADMIN = 'Super admin',
//   STORE_OWNER = 'Store owner',
//   STAFF = 'Staff',
//   CUSTOMER = 'Customer',
// }
export class RegisterDto extends PickType(User, ['name', 'email', 'password', 'type', 'UsrBy', 'contact']) {
  permission: Permission
  isVerified: boolean;
}

export class LoginDto extends PartialType(
  PickType(User, ['email', 'password']),
) { }

export class SocialLoginDto {
  provider: string;
  access_token: string;
}
export class ChangePasswordDto {
  email: string;
  oldPassword: string;
  newPassword: string;
}
export class ForgetPasswordDto {
  email: string;
}
export class VerifyForgetPasswordDto {
  email: string;
  token: number;
}
export class ResetPasswordDto {
  email: string;
  token: number;
  password: string;
}

export interface PermissionItem {
  type: string;
  read: boolean;
  write: boolean;
}

export class AuthResponse {
  token: string;
  permissions: any[];
  type_name?: string[]
  success?: boolean;
  message?: string;
}

export class CoreResponse extends CoreMutationOutput { }

export class VerifyOtpDto {
  otp_id: string;
  code: number;
  phone_number: string;
}

export class OtpResponse {
  id: string;
  message: string;
  success: boolean;
  phone_number: string;
  provider: string;
  is_contact_exist: boolean;
}
export class OtpDto {
  phone_number: string;
}

export class UpdateOtpDto {
  otp: number;
}

export class OtpLoginDto {
  otp_id: string;
  code: string;
  phone_number: string;
  name?: string;
  email?: string;
}

export class GetUserArgs {
  id: number;
  text: string;
  first: number;
  page: number;
}
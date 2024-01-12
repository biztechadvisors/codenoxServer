/* eslint-disable prettier/prettier */
import { PartialType, PickType } from '@nestjs/swagger';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { User } from 'src/users/entities/user.entity';

enum Permission {
  SUPER_ADMIN = 'Super admin',
  STORE_OWNER = 'Store owner',
  STAFF = 'Staff',
  CUSTOMER = 'Customer',
}
export class RegisterDto extends PickType(User, ['name', 'email', 'password']) {
  permission: Permission = Permission.CUSTOMER;
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
  token: string;
}
export class ResetPasswordDto {
  email: string;
  token: string;
  password: string;
}

export class AuthResponse {
  token: string;
  type_name: string[]
  permissions: PermissionItem[];
  success?: boolean;
  message?: string;
}
export interface PermissionItem {
  type: string;
  read: boolean;
  write: boolean;
}

// export class PermissionsDTO {
//   id: number;
//   type_name: string; // Corrected property name
//   permission: PermissionDTO[];
// }

// export class PermissionDTO {
//   type: string;
//   read: boolean;
//   write: boolean;
// }


// export class AuthResponse {
//   token: string;
//   permissions: string[];
//   success?: boolean;
//   message?: string;
// }
export class CoreResponse extends CoreMutationOutput { }
export class VerifyOtpDto {
  otp_id: string;
  code: string;
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

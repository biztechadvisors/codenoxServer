import { CreateAddressDto } from 'src/address/dto/create-address.dto';
import { User } from '../entities/user.entity';
import { CreateProfileDto } from './create-profile.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Permission } from 'src/permission/entities/permission.entity';
declare const CreateUserDto_base: import("@nestjs/common").Type<Pick<User, "name" | "password" | "email" | "otp" | "isVerified" | "is_active">>;
export declare class CreateUserDto extends CreateUserDto_base {
    address: CreateAddressDto[];
    profile: CreateProfileDto;
    managed_shop: Shop;
    permission: Permission;
}
export {};

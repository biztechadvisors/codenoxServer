import { Shop } from '../entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Permission } from '@db/src/permission/entities/permission.entity';
declare const CreateShopDto_base: import("@nestjs/common").Type<Pick<Shop, "name" | "slug" | "address" | "description" | "logo" | "settings" | "balance" | "owner" | "dealerCount">>;
export declare class CreateShopDto extends CreateShopDto_base {
    categories: number[];
    permission: Permission;
    additionalPermissions: Permission[];
    cover_image: Attachment[];
    user: User;
}
export declare class ApproveShopDto {
    id: number;
    admin_commission_rate: number;
}
export {};

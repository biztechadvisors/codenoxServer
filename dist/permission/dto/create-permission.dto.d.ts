import { Permission, PermissionType } from "../entities/permission.entity";
declare const CreatePermissionDto_base: import("@nestjs/common").Type<Pick<Permission, "id" | "user" | "type_name" | "permission_name">>;
export declare class CreatePermissionDto extends CreatePermissionDto_base {
    permissions: CreatePermissionTypeDto[];
}
declare const CreatePermissionTypeDto_base: import("@nestjs/common").Type<Pick<PermissionType, "type" | "id" | "read" | "write">>;
export declare class CreatePermissionTypeDto extends CreatePermissionTypeDto_base {
    permission: CreatePermissionDto;
}
export {};

import { Shop } from "src/shops/entities/shop.entity";
export declare class Permission {
    id: number;
    type_name: string;
    permission_name: string;
    permissions: PermissionType[];
    user: number;
    shop: number;
    shops?: Shop[];
}
export declare class PermissionType {
    id: number;
    type: string;
    read: boolean;
    write: boolean;
    permissions: Permission;
}

import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionService } from "./permission.service";
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    createPermission(createPermission: CreatePermissionDto): Promise<string>;
    getPermission(userId: string): Promise<import("./entities/permission.entity").Permission[]>;
    getPermissionID(id: number): Promise<unknown>;
    updatePermission(id: string, updatePermissionDto: UpdatePermissionDto): Promise<import("./entities/permission.entity").Permission | "Update unsuccessful">;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}

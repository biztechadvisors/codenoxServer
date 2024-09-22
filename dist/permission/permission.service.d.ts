import { CreatePermissionDto } from "./dto/create-permission.dto";
import { Permission, PermissionType } from "./entities/permission.entity";
import { Repository } from "typeorm";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { User } from "src/users/entities/user.entity";
import { Cache } from "cache-manager";
export declare class PermissionService {
    private readonly permissionRepository;
    private readonly permissionTypeRepository;
    private readonly userRepository;
    private readonly cacheManager;
    constructor(permissionRepository: Repository<Permission>, permissionTypeRepository: Repository<PermissionType>, userRepository: Repository<User>, cacheManager: Cache);
    create(createPermission: CreatePermissionDto): Promise<string>;
    getPermission(userId: any): Promise<Permission[]>;
    getPermissionID(id: number): Promise<unknown>;
    updatePermission(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission | "Update unsuccessful">;
    remove(id: number): Promise<import("typeorm").DeleteResult>;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const permission_entity_1 = require("./entities/permission.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const cacheService_1 = require("../helpers/cacheService");
let PermissionService = class PermissionService {
    constructor(permissionRepository, permissionTypeRepository, userRepository, cacheManager, cacheService) {
        this.permissionRepository = permissionRepository;
        this.permissionTypeRepository = permissionTypeRepository;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.cacheService = cacheService;
    }
    async create(createPermission) {
        const existingPermission = await this.permissionRepository.findOne({ where: { permission_name: createPermission.permission_name } });
        if (existingPermission) {
            return 'Already exist';
        }
        if (createPermission && createPermission.type_name) {
            const permissions = new permission_entity_1.Permission();
            permissions.type_name = createPermission.type_name;
            permissions.permission_name = createPermission.permission_name;
            permissions.user = createPermission.user;
            const savedPermission = await this.permissionRepository.save(permissions);
            if (Array.isArray(createPermission.permissions) && createPermission.permissions.length > 0) {
                for (const permissionData of createPermission.permissions) {
                    const permissionType = new permission_entity_1.PermissionType();
                    permissionType.read = permissionData.read;
                    permissionType.write = permissionData.write;
                    permissionType.type = permissionData.type;
                    permissionType.permissions = savedPermission;
                    await this.permissionTypeRepository.save(permissionType);
                }
            }
            else {
                console.error('Permission types array is empty or not provided.');
            }
        }
        else {
            console.error('Invalid createPermission object.');
        }
    }
    async getPermission(userId) {
        const cacheKey = `permissions-user-${userId}`;
        try {
            let permissions = await this.cacheManager.get(cacheKey);
            if (!permissions) {
                permissions = await this.permissionRepository
                    .createQueryBuilder('permission')
                    .leftJoinAndSelect('permission.permissions', 'permissionTypes')
                    .select(['permission.id', 'permission.type_name', 'permission.permission_name'])
                    .addSelect(['permissionTypes.id', 'permissionTypes.type', 'permissionTypes.read', 'permissionTypes.write'])
                    .where("permission.user = :user", { user: Number(userId) })
                    .getMany();
                const groupedPermissions = permissions.reduce((acc, permission) => {
                    const typeName = permission.type_name;
                    const permissionName = permission.permission_name;
                    if (!acc[permissionName]) {
                        acc[permissionName] = {
                            id: permission.id,
                            type_name: typeName,
                            permission_name: permissionName,
                            user: permission.user,
                            permissions: [],
                        };
                    }
                    for (const permissionType of permission.permissions) {
                        acc[permissionName].permissions.push({
                            id: permissionType.id,
                            type: permissionType.type,
                            read: permissionType.read,
                            write: permissionType.write,
                        });
                    }
                    return acc;
                }, {});
                permissions = Object.values(groupedPermissions);
                await this.cacheManager.set(cacheKey, permissions, 60);
            }
            return permissions;
        }
        catch (error) {
            console.error('Error in getPermission:', error);
            throw error;
        }
    }
    async getPermissionID(id) {
        const cacheKey = `permission-id-${id}`;
        try {
            let formattedResult = await this.cacheManager.get(cacheKey);
            if (!formattedResult) {
                const result = await this.permissionRepository
                    .createQueryBuilder('permission')
                    .leftJoinAndSelect('permission.permissions', 'permissions')
                    .where('permission.id = :id', { id })
                    .select([
                    'permission.id',
                    'permission.type_name',
                    'permission.permission_name',
                    'permissions.id',
                    'permissions.type',
                    'permissions.read',
                    'permissions.write',
                ])
                    .getMany();
                formattedResult = result.map(permission => ({
                    id: permission.id,
                    type_name: permission.type_name,
                    permissionName: permission.permission_name,
                    user: permission.user,
                    permission: permission.permissions.map(p => ({
                        id: p.id,
                        type: p.type,
                        read: p.read,
                        write: p.write,
                    })),
                }));
                await this.cacheManager.set(cacheKey, formattedResult[0], 60);
            }
            return formattedResult;
        }
        catch (error) {
            console.error('Error in getPermissionID:', error);
            throw error;
        }
    }
    async updatePermission(id, updatePermissionDto) {
        try {
            const permissionToUpdate = await this.permissionRepository
                .createQueryBuilder('permission')
                .leftJoinAndSelect('permission.permissions', 'permissions')
                .where('permission.id = :id', { id })
                .getOne();
            if (!permissionToUpdate) {
                throw new Error('Permission not found');
            }
            permissionToUpdate.type_name = updatePermissionDto.type_name;
            permissionToUpdate.permission_name = updatePermissionDto.permission_name;
            permissionToUpdate.user = updatePermissionDto.user;
            const updatedPermissionIds = updatePermissionDto.permissions.map(p => p.id);
            const permissionsToRemove = permissionToUpdate.permissions.filter(pt => !updatedPermissionIds.includes(pt.id));
            if (Array.isArray(updatePermissionDto.permissions) && updatePermissionDto.permissions.length > 0) {
                for (const updatedPermission of updatePermissionDto.permissions) {
                    let permissionTypeToUpdate;
                    if (updatedPermission.id) {
                        permissionTypeToUpdate = permissionToUpdate.permissions.find(pt => pt.id === updatedPermission.id);
                    }
                    else {
                        permissionTypeToUpdate = new permission_entity_1.PermissionType();
                        permissionTypeToUpdate.permissions = permissionToUpdate;
                        permissionTypeToUpdate.id = updatedPermission.id;
                    }
                    if (permissionTypeToUpdate) {
                        permissionTypeToUpdate.read = updatedPermission.read;
                        permissionTypeToUpdate.type = updatedPermission.type;
                        permissionTypeToUpdate.write = updatedPermission.write;
                        await this.permissionTypeRepository.save(permissionTypeToUpdate);
                    }
                }
            }
            if (permissionsToRemove.length > 0) {
                await this.permissionTypeRepository.remove(permissionsToRemove);
            }
            return permissionToUpdate;
        }
        catch (error) {
            console.error(error);
            return 'Update unsuccessful';
        }
    }
    async remove(id) {
        await this.permissionTypeRepository
            .createQueryBuilder()
            .delete()
            .where('permissionsId = :id', { id })
            .execute();
        const result = await this.permissionRepository
            .createQueryBuilder()
            .delete()
            .where('id = :id', { id })
            .execute();
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Permission not found');
        }
        return result;
    }
};
PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.PermissionType)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object, cacheService_1.CacheService])
], PermissionService);
exports.PermissionService = PermissionService;
//# sourceMappingURL=permission.service.js.map
/* eslint-disable prettier/prettier */
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreatePermissionDto, CreatePermissionTypeDto } from "./dto/create-permission.dto";
import { Permission, PermissionType } from "./entities/permission.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { User } from "src/users/entities/user.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class PermissionService {

  constructor(
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(PermissionType) private readonly permissionTypeRepository: Repository<PermissionType>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache

  ) { }

  async create(createPermission: CreatePermissionDto) {

    const existingPermission = await this.permissionRepository.findOne({ where: { permission_name: createPermission.permission_name } })
    if (existingPermission) {
      return 'Already exist'
    }

    if (createPermission && createPermission.type_name) {
      const permissions = new Permission();
      permissions.type_name = createPermission.type_name;
      permissions.permission_name = createPermission.permission_name;
      permissions.user = createPermission.user;

      const savedPermission = await this.permissionRepository.save(permissions);

      if (Array.isArray(createPermission.permissions) && createPermission.permissions.length > 0) {

        for (const permissionData of createPermission.permissions) {
          const permissionType = new PermissionType();

          permissionType.read = permissionData.read;
          permissionType.write = permissionData.write;
          permissionType.type = permissionData.type;
          permissionType.permissions = savedPermission;

          await this.permissionTypeRepository.save(permissionType);


        }
      } else {
        console.error('Permission types array is empty or not provided.');
      }

    } else {
      console.error('Invalid createPermission object.');
    }
  }

  async getPermission(userId: any) {
    const cacheKey = `permissions-user-${userId}`;

    try {
      let permissions: Permission[] = await this.cacheManager.get(cacheKey);

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

        // Cache the result
        await this.cacheManager.set(cacheKey, permissions, 3600); // Cache for 1 hour
      }

      return permissions;
    } catch (error) {
      console.error('Error in getPermission:', error);
      throw error;
    }
  }

  async getPermissionID(id: number) {
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

        // Cache the result
        await this.cacheManager.set(cacheKey, formattedResult[0], 3600); // Cache for 1 hour
      }

      return formattedResult;
    } catch (error) {
      console.error('Error in getPermissionID:', error);
      throw error;
    }
  }



  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {

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
          } else {
            permissionTypeToUpdate = new PermissionType();
            permissionTypeToUpdate.permissions = permissionToUpdate;
            permissionTypeToUpdate.id = updatedPermission.id; // Save the id of the PermissionType
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
    } catch (error) {
      console.error(error);
      return 'Update unsuccessful';
    }
  }

  async remove(id: number) {
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
      throw new NotFoundException('Permission not found');
    }
    return result;
  }
}
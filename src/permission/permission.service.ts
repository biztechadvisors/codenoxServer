/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePermissionDto, CreatePermissionTypeDto } from "./dto/create-permission.dto";
import { Permission, PermissionType } from "./entities/permission.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdatePermissionDto } from "./dto/update-permission.dto";

@Injectable()
export class PermissionService {

  constructor(
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(PermissionType) private readonly permissionTypeRepository: Repository<PermissionType>
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


  async getPermission() {
    try {
      const permissions = await this.permissionRepository
        .createQueryBuilder('permission')
        .leftJoinAndSelect('permission.permissions', 'permissionTypes') // Use a different alias to avoid confusion
        .select(['permission.id', 'permission.type_name', 'permission.permission_name'])
        .addSelect(['permissionTypes.id', 'permissionTypes.type', 'permissionTypes.read', 'permissionTypes.write'])
        .getMany();

      const groupedPermissions = permissions.reduce((acc, permission) => {
        const typeName = permission.type_name;
        const permissionName = permission.permission_name;

        if (!acc[permissionName]) {
          acc[permissionName] = {
            id: permission.id,
            type_name: typeName,
            permission_name: permissionName,
            permissions: [],
          };
        }

        // Access properties of individual PermissionType objects
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

      return Object.values(groupedPermissions);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  async getPermissionID(id: number) {
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

    const formattedResult = result.map(permission => ({
      id: permission.id,
      type_name: permission.type_name,
      permissionName: permission.permission_name,
      permission: permission.permissions.map(p => ({
        id: p.id,
        type: p.type,
        read: p.read,
        write: p.write,
      })),
    }));

    return formattedResult[0];
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

      if (Array.isArray(updatePermissionDto.permissions) && updatePermissionDto.permissions.length > 0) {
        for (const updatedPermission of updatePermissionDto.permissions) {

          if (!updatedPermission.id) {

            const newPermissionType = new PermissionType();
            newPermissionType.read = updatedPermission.read;
            newPermissionType.type = updatedPermission.type;
            newPermissionType.write = updatedPermission.write;
            newPermissionType.permissions = permissionToUpdate
            await this.permissionTypeRepository.save(newPermissionType);

          } else {
            const existingPermissionType = permissionToUpdate.permissions.find(pt => pt.id === updatedPermission.id);
            if (existingPermissionType) {
              existingPermissionType.read = updatedPermission.read;
              existingPermissionType.type = updatedPermission.type;
              existingPermissionType.write = updatedPermission.write;
              await this.permissionTypeRepository.save(existingPermissionType);
            }
          }
        }
        // Remove permissions not present in the updated list
        const updatedPermissionIds = updatePermissionDto.permissions.map(p => p.id);
        const permissionsToRemove = permissionToUpdate.permissions.filter(pt => !updatedPermissionIds.includes(pt.id));
        await this.permissionTypeRepository.remove(permissionsToRemove);
        permissionToUpdate.permissions = permissionToUpdate.permissions.filter(pt => !permissionsToRemove.includes(pt));
      } else {
        // If no permissions provided in the update, remove all existing permissions
        await this.permissionTypeRepository.remove(permissionToUpdate.permissions);
        permissionToUpdate.permissions = [];
      }

      // Save the updated permission
      await this.permissionRepository.save(permissionToUpdate);

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
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

      if (Array.isArray(createPermission.permission) && createPermission.permission.length > 0) {

        for (const permissionData of createPermission.permission) {
          const permissionType = new PermissionType();

          permissionType.read = permissionData.read;
          permissionType.write = permissionData.write;
          permissionType.type = permissionData.type;
          permissionType.permissions = savedPermission;

          const pre = await this.permissionTypeRepository.save(permissionType);
          console.log("pre,os++++++++++++", pre)

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
        'permissions.id as permissionId',
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
        id: p.permissionId,
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

      if (Array.isArray(updatePermissionDto.permission) && updatePermissionDto.permission.length > 0) {
        for (const updatedPermission of updatePermissionDto.permission) {
          permissionToUpdate.permissions.forEach(async (permissionType) => {
            if (permissionType.id === updatedPermission.id) {
              permissionType.read = updatedPermission.read;
              permissionType.type = updatedPermission.type;
              permissionType.write = updatedPermission.write;
              await this.permissionTypeRepository.save(permissionType)
              if (!permissionType.read) {
                await this.permissionTypeRepository.remove(permissionType);
              }
            }
          });
        }
      }
      const savePermissionToUpdate = await this.permissionRepository.save(permissionToUpdate);

      return savePermissionToUpdate;
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
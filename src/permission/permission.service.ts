/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePermissionDto, CreatePermissionTypeDto } from "./dto/create-permission.dto";
import { Permission, PermissionType } from "./entities/permission.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdatePermissionDto } from "./dto/update-permission.dto";

@Injectable()
export class PermissionService{

    constructor(
        @InjectRepository(Permission) private readonly permissionRepository:Repository<Permission>,
        @InjectRepository(PermissionType) private readonly permissionTypeRepository:Repository<PermissionType>
    ){}

    async create(createPermission: CreatePermissionDto) {
        console.log('createPermission-Work');
        console.log(createPermission);
        const existingPermission = await this.permissionRepository.findOne({where:{permission_name: createPermission.permission_name}})
        if(existingPermission){
          return 'Already exist'
        }

        if (createPermission && createPermission.type_name) {
            const permissions = new Permission();
            permissions.type_name = createPermission.type_name;
            permissions.permission_name = createPermission.permission_name;
        
            const savedPermission = await this.permissionRepository.save(permissions);
            console.log(createPermission.permission)
        
            if (Array.isArray(createPermission.permission) && createPermission.permission.length > 0) {
                console.log(createPermission.permission)
                for (const permissionData of createPermission.permission) {
                    const permissionType = new PermissionType();
                    
                    permissionType.read = permissionData.read;
                    permissionType.write = permissionData.write;
                    permissionType.type = permissionData.type;
                    permissionType.permissions = savedPermission;
                  
                    await this.permissionTypeRepository.save(permissionType);
                  
                    console.log(permissionType);
                  }
            } else {
                console.error('Permission types array is empty or not provided.');
            }
            console.log(savedPermission);
            console.log(permissions);
        } else {
            console.error('Invalid createPermission object.');
        }
    }
    async getPermission(){
        const permissionsWithTypeName = await this.permissionTypeRepository
        .createQueryBuilder('permission')
        .leftJoinAndSelect('permission.permissions', 'permissions')
        .select(['permission.id', 'permissions.type_name', 'permissions.permission_name','permissions.id', 'permission.type', 'permission.read', 'permission.write'])
        .getMany();

      const groupedPermissions = permissionsWithTypeName.reduce((acc, permission) => {
        console.log(permission)
        const typeName = permission.permissions.type_name;
        const permissionName = permission.permissions.permission_name;

        if (!acc[typeName]) {
          acc[typeName] = {
            id: permission.permissions.id,
            type_name: typeName,
            permission_name: permissionName,
            permission: [],
          };
        }
    
        acc[typeName].permission.push({
          id: permission.id,
          type: permission.type,
          read: permission.read,
          write: permission.write,
        });
    
        return acc;
      }, {});
      const result = Object.values(groupedPermissions);
    
      return result;
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
      
          const formattedResult = result.map(permission => {
            return {
              id: permission.id,
              type_name: permission.type_name,
              permissionName: permission.permission_name,
              permission: permission.permissions.map(p => ({
                id: p.id,
                type: p.type,
                read: p.read,
                write: p.write,
              })),
            };
          });
          
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
          // console.log(permissionToUpdate)
        
          permissionToUpdate.type_name = updatePermissionDto.type_name;
          permissionToUpdate.permission_name = updatePermissionDto.permission_name;
        
          if (Array.isArray(updatePermissionDto.permission) && updatePermissionDto.permission.length > 0) {
            for (const updatedPermission of updatePermissionDto.permission) {
              if (!updatedPermission.id) {
                const newPermissionType = new PermissionType();
                newPermissionType.read = updatedPermission.read;
                newPermissionType.type = updatedPermission.type;
                newPermissionType.write = updatedPermission.write;
                newPermissionType.permissions = permissionToUpdate
                await this.permissionTypeRepository.save(newPermissionType);

                  // permissionToUpdate.permissions.push(savedPermissionType);
              } else {
                const existingPermissionType = permissionToUpdate.permissions.find(pt => pt.id === updatedPermission.id);
                if (existingPermissionType) {
                  existingPermissionType.read = updatedPermission.read;
                  existingPermissionType.type = updatedPermission.type;
                  existingPermissionType.write = updatedPermission.write;

                  await this.permissionTypeRepository.save(existingPermissionType);
                  if (!updatedPermission.read) {
                    await this.permissionTypeRepository.remove(existingPermissionType);
                    permissionToUpdate.permissions = permissionToUpdate.permissions.filter(pt => pt !== existingPermissionType);
                  }
                }
              }
            }
          }
            // Return the permissionToUpdate directly, as it's already of type Permission
          console.log(permissionToUpdate)
          return permissionToUpdate;
        } catch (error) {
          console.error(error);
          return 'Update unsuccessful';
        }
      }

    // async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    //   try {
    //     const permissionToUpdate = await this.permissionRepository
    //       .createQueryBuilder('permission')
    //       .leftJoinAndSelect('permission.permissions', 'permissions')
    //       .where('permission.id = :id', { id })
    //       .getOne();
    
    //     if (!permissionToUpdate) {
    //       throw new Error('Permission not found');
    //     }
    
    //     permissionToUpdate.type_name = updatePermissionDto.type_name;
    //     permissionToUpdate.permission_name = updatePermissionDto.permission_name;

    //     if (Array.isArray(updatePermissionDto.permission) && updatePermissionDto.permission.length > 0) {
    //       for (const updatedPermission of updatePermissionDto.permission) {
    //         permissionToUpdate.permissions.forEach(async (permissionType) => {
    //           if (permissionType.id === updatedPermission.id) {
    //             permissionType.read = updatedPermission.read;
    //             permissionType.type = updatedPermission.type;
    //             permissionType.write = updatedPermission.write;
    //             await this.permissionTypeRepository.save(permissionType)
    //             if (!permissionType.read) {
    //               await this.permissionTypeRepository.remove(permissionType);
    //             }
    //           }
    //         });
    //       }
    //     }
    //     const savePermissionToUpdate = await this.permissionRepository.save(permissionToUpdate);
    
    //     return savePermissionToUpdate;
    //   } catch (error) {
    //     console.error(error);
    //     return 'Update unsuccessful';
    //   }
    // }

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
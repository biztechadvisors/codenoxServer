/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
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
        console.log(createPermission);
    
        if (createPermission && createPermission.type_name) {
            const permissions = new Permission();
            permissions.type_name = createPermission.type_name;
        
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
        .select(['permission.id', 'permissions.type_name', 'permissions.id', 'permission.type', 'permission.read', 'permission.write'])
        .getMany();

      const groupedPermissions = permissionsWithTypeName.reduce((acc, permission) => {
        console.log(permission)
        const typeName = permission.permissions.type_name;
    
        if (!acc[typeName]) {
          acc[typeName] = {
            id: permission.permissions.id,
            type_name: typeName,
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
            'permissions.id as permissionId',
            'permissions.type',
            'permissions.read',
            'permissions.write',
          ])
          .getMany();
      
        const formattedResult = result.map(permission => ({
          id: permission.id,
          type_name: permission.type_name,
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
    
        if (Array.isArray(updatePermissionDto.permission) && updatePermissionDto.permission.length > 0) {
          for (const updatedPermission of updatePermissionDto.permission) {
            permissionToUpdate.permissions.forEach(async (permissionType) => {
              if (permissionType.id === updatedPermission.id) {
                permissionType.read = updatedPermission.read;
                permissionType.type = updatedPermission.type;
                permissionType.write = updatedPermission.write;
                await this.permissionTypeRepository.save(permissionType)
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


    //     if(Array.isArray(updatePermissionDto.permission)&& updatePermissionDto.permission){
    //     for (const updatedPermission of updatePermissionDto.permission) {
    //       // console.log('updatedPermission.permissionId')
    //       // console.log(updatedPermission.id)
    //       permissionToUpdate.permissions.forEach((permissionType) => {
    //         const updatePermission = permissionType.id === updatedPermission.id;
    //         if (updatePermission) {
    //           permissionType.read = updatedPermission.read;
    //           permissionType.type = updatedPermission.type;
    //           permissionType.write = updatedPermission.write;
    //           permissionType.permissions = permissionToUpdate;
    //         }
    //         console.log(updatePermission);
    //       });
    //       // const permissionTypeFlags = permissionToUpdate.permissions.map((permissionType) => {
    //       //   if(permissionType.id === permissionToUpdate.id){
    //       //     console.log(permissionType.id)
    //       //   }
    //       //   // console.log('permissionType.id')
    //       //   // console.log(permissionType.id)
    //       //   // console.log('permissionToUpdate.id')
    //       //   // console.log(updatedPermission.id)
    //       //   // return permissionType.id === permissionToUpdate.id;
    //       // });
          
    //       // console.log(permissionTypeFlags);

    //       // const permissionTypeFlags = permissionToUpdate.permissions.map((permissionType) => {
    //       //   const updatePermission = permissionType.id === updatedPermission.id;
    //       //   if(updatePermission){
    //       //     permissionType.read = updatedPermission.read
    //       //     permissionType.type = updatedPermission.type
    //       //     permissionType.write = updatedPermission.write
    //       //     permissionType.id = permissionToUpdate.id
    //       //   }
    //       //   console.log(updatePermission);
           
    //       //   // return updatePermission;
    //       // });
    //       // console.log(permissionTypeFlags)
    //     }
    //   }
    //     // await this.permissionRepository.save(permissionToUpdate);
    // console.log(permissionToUpdate)
    //     return permissionToUpdate;
    //   } catch (error) {
    //     console.error(error);
    //     return 'Update unsuccessful';
    //   }
    // }   
}
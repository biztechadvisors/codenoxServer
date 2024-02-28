/* eslint-disable prettier/prettier */

import { PickType } from "@nestjs/swagger";
import { Permission, PermissionType } from "../entities/permission.entity";

export class CreatePermissionDto extends PickType(Permission, [
    'id',
    'type_name',
    'permission_name'
]) { permissions: CreatePermissionTypeDto }


export class CreatePermissionTypeDto extends PickType(PermissionType, [
    'id',
    'read',
    'write',
    'type',
]) { permission: CreatePermissionDto }
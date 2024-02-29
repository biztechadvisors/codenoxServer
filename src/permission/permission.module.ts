/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission, PermissionType } from "./entities/permission.entity";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";
import { User } from "src/users/entities/user.entity";



@Module({
    imports: [TypeOrmModule.forFeature([PermissionType, Permission, User])],
    controllers: [PermissionController],
    providers: [PermissionService]
})

export class PermissionModule { }
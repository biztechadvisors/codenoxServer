/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission, PermissionType } from "./entities/permission.entity";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";
import { User } from "src/users/entities/user.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { PermissionRepository } from "./permission.repository";

@Module({
    imports: [TypeOrmModule.forFeature([PermissionType, Permission, User]),
    TypeOrmModule.forFeature([PermissionRepository]),
    CacheModule.register(),
    ],
    controllers: [PermissionController],
    providers: [PermissionService],
})

export class PermissionModule { }
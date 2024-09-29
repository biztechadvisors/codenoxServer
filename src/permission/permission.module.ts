/* eslint-disable prettier/prettier */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission, PermissionType } from "./entities/permission.entity";
import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";
import { User } from "src/users/entities/user.entity";
import { CacheModule } from "@nestjs/cache-manager";
import { CacheService } from "../helpers/cacheService";
import { ShiprocketService } from "../orders/shiprocket.service";

@Module({
    imports: [TypeOrmModule.forFeature([PermissionType, Permission, User]),
    CacheModule.register(),
    ],
    controllers: [PermissionController],
    providers: [PermissionService, CacheService],
})

export class PermissionModule { }
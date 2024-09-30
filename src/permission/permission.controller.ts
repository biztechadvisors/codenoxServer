/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreatePermissionDto, CreatePermissionTypeDto } from "./dto/create-permission.dto";
// import { Permission } from "@aws-sdk/client-s3";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionService } from "./permission.service";
import { CacheService } from "../helpers/cacheService";

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService,
    private readonly cacheService: CacheService
  ) { }

  @Post()
  async createPermission(@Body() createPermission: CreatePermissionDto) {
    await this.cacheService.invalidateCacheBySubstring('permission')
    return this.permissionService.create(createPermission);
  }

  @Get()
  getPermission(@Query('userId') userId: string) {
    return this.permissionService.getPermission(userId);
  }

  @Get(':id')
  getPermissionID(@Param('id') id: number) {
    return this.permissionService.getPermissionID(+id);
  }

  @Put(':id')
  async updatePermission(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    await this.cacheService.invalidateCacheBySubstring('permission')
    return this.permissionService.updatePermission(+id, updatePermissionDto);
  }


  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring('permission')
    return this.permissionService.remove(+id);
  }
}

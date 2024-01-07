/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreatePermissionDto, CreatePermissionTypeDto } from "./dto/create-permission.dto";
import { PermissionService } from "./permission.service";
import { Permission } from "@aws-sdk/client-s3";
import { UpdatePermissionDto } from "./dto/update-permission.dto";

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  createPermission(@Body() createPermission: CreatePermissionDto) {
    console.log(createPermission);
    return this.permissionService.create(createPermission);
}

  @Get()
  getPermission(){
    return this.permissionService.getPermission();
  }

  @Get(':id')
  getPermissionID(@Param('id') id:number){
    return this.permissionService.getPermissionID(+id);
  }

  @Put(':id')
  updatePermission(@Param('id') id:string, @Body() updatePermissionDto:UpdatePermissionDto){
    return this.permissionService.updatePermission(+id, updatePermissionDto);
  }
}

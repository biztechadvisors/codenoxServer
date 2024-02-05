/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CreatePermissionDto, CreatePermissionTypeDto } from "./dto/create-permission.dto";
// import { Permission } from "@aws-sdk/client-s3";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { PermissionService } from "./permission.service";

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  createPermission(@Body() createPermission: CreatePermissionDto) {
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


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}

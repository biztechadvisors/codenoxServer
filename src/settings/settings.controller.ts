/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { CreateSettingDto } from './dto/create-setting.dto'
import { SettingsService } from './settings.service'
import { UpdateSettingDto } from './dto/update-setting.dto'


@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(
    @Param('id') id:number,
    @Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(id, createSettingDto)
  }

  @Get()
  findAll() {
    return this.settingsService.findAll()
  }

  @Put('/:id')
  update(
    @Param('id') id: number,
    @Body() updateSettingDto: UpdateSettingDto){
    return this.settingsService.update(id, updateSettingDto)
  }

  @Get()
  findOne( @Param('id') id:number ) {
    return this.settingsService.findOne(id)
  }

  @Delete(':id')
  remove( @Param('id') id:number) {
    console.log("first", id)
    return this.settingsService.remove(id)
  }
}

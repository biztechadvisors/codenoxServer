/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CreateSettingDto } from './dto/create-setting.dto'
import { SettingsService } from './settings.service'
import { UpdateSettingDto } from './dto/update-setting.dto'


@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Post()
  create(
    @Query('shopId') shopId: number,
    @Body() createSettingDto: CreateSettingDto) {
    console.log('shopId**', shopId)
    return this.settingsService.create(shopId, createSettingDto)
  }

  @Get()
  findAll() {
    return this.settingsService.findAll()
  }

  @Put('/:id')
  update(
    @Param('id') id: number,
    @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(id, updateSettingDto)
  }

  @Get(':id/:shop_id')
  findOne(@Param('id') id: number, @Param('shop_id') shop_id: number) {
    return this.settingsService.findOne(id, shop_id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    console.log('first', id)
    return this.settingsService.remove(id)
  }
}
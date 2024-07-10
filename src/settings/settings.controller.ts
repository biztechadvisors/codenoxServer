/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CreateSettingDto } from './dto/create-setting.dto'
import { SettingsService } from './settings.service'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { query } from 'express'


@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Post()
  create(
    @Query('shopId') shopId: number,
    @Body() createSettingDto: CreateSettingDto
  ) {
    return this.settingsService.create(shopId, createSettingDto);
  }

  @Put('/:id')
  update(
    @Param('id') id: number,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @Get('')
  findOne(@Query('shopSlug') shopSlug: string) {
    return this.settingsService.findOne(shopSlug);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.settingsService.remove(id)
  }
}
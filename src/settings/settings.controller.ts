/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CreateSettingDto } from './dto/create-setting.dto'
import { SettingsService } from './settings.service'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { query } from 'express'
import { CacheService } from '../helpers/cacheService'


@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService,
    private readonly cacheService: CacheService) { }

  @Post()
  async create(
    @Query('shopId') shopId: number,
    @Body() createSettingDto: CreateSettingDto
  ) {
    await this.cacheService.invalidateCacheBySubstring('settings_shop')
    return this.settingsService.create(shopId, createSettingDto);
  }

  @Put('/:id')
  async update(
    @Param('id') id: number,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    await this.cacheService.invalidateCacheBySubstring('settings_shop')
    return this.settingsService.update(id, updateSettingDto);
  }

  @Get('')
  async findOne(@Query('shopSlug') shopSlug: string) {
    const settings = await this.settingsService.findOne(shopSlug);
    // Return a default value or handle null case
    if (!settings) {
      return {}; // or handle appropriately
    }
    return settings;
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.cacheService.invalidateCacheBySubstring('settings_shop')
    return this.settingsService.remove(id)
  }
}
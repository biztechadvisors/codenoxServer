/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { SettingsController } from './settings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Setting, SettingsOptions } from './entities/setting.entity'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { SettingRepository, SettingsOptionsRepository } from './settings.repository'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([
    SettingRepository,
    SettingsOptionsRepository
  ]),TypeOrmModule.forFeature([Setting, SettingsOptions])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

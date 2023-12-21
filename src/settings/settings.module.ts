/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { SettingsController } from './settings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContactDetails, Location, Setting, SettingsOptions } from './entities/setting.entity'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { ContactDetailsRepository, SettingRepository, SettingsOptionsRepository } from './settings.repository'
import { LocationRepository } from 'src/shops/shops.repository'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([
    SettingRepository,
    SettingsOptionsRepository,
    ContactDetailsRepository,
    LocationRepository
  ]),TypeOrmModule.forFeature([Setting, SettingsOptions, ContactDetails, Location])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

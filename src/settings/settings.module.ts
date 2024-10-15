/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { SettingsController } from './settings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContactDetails, CurrencyOptions, DeliveryTime, EmailAdmin, EmailCustomer, EmailEvent, EmailVendor, Location, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, Setting, SettingsOptions, ShopSocials, SmsAdmin, SmsCustomer, SmsEvent, SmsVendor } from './entities/setting.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { CacheService } from '../helpers/cacheService'

@Module({
  imports: [TypeOrmModule.forFeature([Setting, Attachment, PaymentGateway, LogoSettings, DeliveryTime, ServerInfo, SeoSettings, SmsEvent, SmsAdmin, SmsVendor, SmsCustomer, EmailAdmin, EmailVendor, EmailCustomer, EmailEvent, CurrencyOptions, ShopSocials, SettingsOptions, ContactDetails, Location, Shop]),
  CacheModule.register()
  ],
  controllers: [SettingsController],
  providers: [SettingsService, CacheService],
  exports: [SettingsService],
})
export class SettingsModule { }
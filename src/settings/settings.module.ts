/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { SettingsService } from './settings.service'
import { SettingsController } from './settings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContactDetails, CurrencyOptions, DeliveryTime, EmailAdmin, EmailCustomer, EmailEvent, EmailVendor, Location, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, Setting, SettingsOptions, ShopSocials, SmsAdmin, SmsCustomer, SmsEvent, SmsVendor } from './entities/setting.entity'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { ContactDetailsRepository, CurrencyOptionsRepository, DeliveryTimeRepository, EmailAdminRepository, EmailCustomerRepository, EmailEventRepository, EmailVendorRepository, LogoSettingsRepository, PaymentGateWayRepository, SeoSettingsRepository, ServerInfoRepository, SettingRepository, SettingsOptionsRepository, SmsAdminRepository, SmsCustomerRepository, SmsEventRepository, SmsVendorRepository } from './settings.repository'
import { LocationRepository, ShopSocialRepository } from 'src/shops/shops.repository'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([
    SettingRepository,
    SettingsOptionsRepository,
    ContactDetailsRepository,
    LocationRepository,
    ShopSocialRepository,
    CurrencyOptionsRepository,
    EmailEventRepository,
    EmailAdminRepository,
    EmailVendorRepository,
    EmailCustomerRepository,
    SmsEventRepository,
    SmsAdminRepository,
    SmsVendorRepository,
    SmsCustomerRepository,
    SeoSettingsRepository,
    ServerInfoRepository,
    DeliveryTimeRepository,
    LogoSettingsRepository,
    PaymentGateWayRepository,
  ]),TypeOrmModule.forFeature([Setting, PaymentGateway, LogoSettings, DeliveryTime, ServerInfo, SeoSettings, SmsEvent, SmsAdmin, SmsVendor, SmsCustomer, EmailAdmin, EmailVendor, EmailCustomer, EmailEvent, CurrencyOptions, ShopSocials, SettingsOptions, ContactDetails, Location])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}

/* eslint-disable prettier/prettier */

import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { ContactDetails, CurrencyOptions, DeliveryTime, EmailAdmin, EmailCustomer, EmailVendor, Location, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, Setting,SettingsOptions, ShopSocials } from "./entities/setting.entity";
import { Repository } from "typeorm";

@CustomRepository(Setting)
export class SettingRepository extends Repository<Setting>{}

@CustomRepository(SettingsOptions)
export class SettingOptionsRepository extends Repository<SettingsOptions>{}

@CustomRepository(SeoSettings)
export class SeoSettingsRepository extends Repository<SeoSettings>{}

@CustomRepository(ServerInfo)
export class ServerInfoRepository extends Repository<ServerInfo>{}

@CustomRepository(DeliveryTime)
export class DeliveryTimeRepository extends Repository<DeliveryTime>{}

@CustomRepository(ContactDetails)
export class ContactDetailsRepository extends Repository<ContactDetails>{}

@CustomRepository(ShopSocials)
export class ShopSocialsRepository extends Repository<ShopSocials>{}

@CustomRepository(Location)
export class LocationRepository extends Repository<Location>{}

@CustomRepository(PaymentGateway)
export class OptionPaymentRepository extends Repository<PaymentGateway>{}

@CustomRepository(CurrencyOptions)
export class CurrencyOptionsRepository extends Repository<CurrencyOptions>{}

@CustomRepository(EmailAdmin)
export class EmailAdminRepository extends Repository<EmailAdmin>{}

@CustomRepository(EmailVendor)
export class EmailVendorRepository extends Repository<EmailVendor>{}

@CustomRepository(EmailCustomer)
export class EmailCustomerRepository extends Repository<EmailCustomer>{}

@CustomRepository(LogoSettings)
export class LogoSettingsRepository extends Repository<LogoSettings>{}
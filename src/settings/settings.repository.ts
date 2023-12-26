/* eslint-disable prettier/prettier */
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";
import { ContactDetails, CurrencyOptions, DeliveryTime, EmailAdmin, EmailCustomer, EmailEvent, EmailVendor, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, Setting, SettingsOptions, SmsAdmin, SmsCustomer, SmsEvent, SmsVendor } from "./entities/setting.entity";

@CustomRepository(Setting)
export class SettingRepository extends Repository<Setting>{}

@CustomRepository(SettingsOptions)
export class SettingsOptionsRepository extends Repository<SettingsOptions>{}

@CustomRepository(ContactDetails)
export class ContactDetailsRepository extends Repository<ContactDetails>{}

@CustomRepository(CurrencyOptions)
export class CurrencyOptionsRepository extends Repository<CurrencyOptions>{}

@CustomRepository(EmailEvent)
export class EmailEventRepository extends Repository<EmailEvent>{}

@CustomRepository(EmailAdmin)
export class EmailAdminRepository extends Repository<EmailAdmin>{}

@CustomRepository(EmailVendor)
export class EmailVendorRepository extends Repository<EmailVendor>{}

@CustomRepository(EmailCustomer)
export class EmailCustomerRepository extends Repository<EmailCustomer>{}

@CustomRepository(SmsEvent)
export class SmsEventRepository extends Repository<SmsEvent>{}

@CustomRepository(SmsAdmin)
export class SmsAdminRepository extends Repository<SmsAdmin>{}

@CustomRepository(SmsVendor)
export class SmsVendorRepository extends Repository<SmsVendor>{}

@CustomRepository(SmsCustomer)
export class SmsCustomerRepository extends Repository<SmsCustomer>{}

@CustomRepository(SeoSettings)
export class SeoSettingsRepository extends Repository<SeoSettings>{}

@CustomRepository(ServerInfo)
export class ServerInfoRepository extends Repository<ServerInfo>{}

@CustomRepository(DeliveryTime)
export class DeliveryTimeRepository extends Repository<DeliveryTime>{}

@CustomRepository(LogoSettings)
export class LogoSettingsRepository extends Repository<LogoSettings>{}

@CustomRepository(PaymentGateway)
export class PaymentGateWayRepository extends Repository<PaymentGateway>{}
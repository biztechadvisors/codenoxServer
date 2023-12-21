/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { SettingDto, SettingsOptionsDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ContactDetails,CurrencyOptions,DeliveryTime, EmailAdmin, EmailCustomer, EmailVendor, Location, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, Setting, SettingsOptions, ShopSocials } from './entities/setting.entity';
import settingsJson from '@db/settings.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { ContactDetailsRepository, CurrencyOptionsRepository, EmailAdminRepository, EmailCustomerRepository, EmailVendorRepository, LocationRepository, LogoSettingsRepository, OptionPaymentRepository, ShopSocialsRepository } from './settings.repository';
const settings = plainToClass(Setting, settingsJson);

@Injectable()
export class SettingsService {
  private settings: Setting = settings;
  // constructor(
  // @InjectRepository(Setting)
  // private readonly settingRepository : Repository<Setting>,
  // @InjectRepository(SettingsOptions)
  // private readonly settingOpsionsRepository : Repository<SettingsOptions>,
  // @InjectRepository(SeoSettings)
  // private readonly seoSettingRepository : Repository<SeoSettings>,
  // @InjectRepository(ServerInfo)
  // private readonly serverInfoRepository : Repository<ServerInfo>,
  // @InjectRepository(DeliveryTime)
  // private readonly deliveryTimeRepository : Repository<DeliveryTime>,
  // @InjectRepository(ContactDetails)
  // private readonly contactRepository : ContactDetailsRepository,
  // @InjectRepository(ShopSocials)
  // private readonly shopSocialsRepository : ShopSocialsRepository,
  // @InjectRepository(Location)
  // private readonly locationRepository : LocationRepository,
  // @InjectRepository(PaymentGateway)
  // private readonly paymentRepository : OptionPaymentRepository,
  // @InjectRepository(CurrencyOptions)
  // private readonly currencyRepository : CurrencyOptionsRepository,
  // @InjectRepository(EmailAdmin)
  // private readonly emailAdminRepository : EmailAdminRepository,
  // @InjectRepository(EmailVendor)
  // private readonly emailVendorRepository : EmailVendorRepository,
  // @InjectRepository(EmailCustomer)
  // private readonly emailCustomerRepository : EmailCustomerRepository,
  // @InjectRepository(LogoSettings)
  // private readonly LogoSettingsRepository : LogoSettingsRepository,
  // ){}


  async create(createSettingDto: SettingDto):Promise<Setting> {
    // const setting = new Setting()

    // setting.language = createSettingDto.language
    // if(createSettingDto.options){
    //   const OptionsDto = createSettingDto.options
    //   const settingOption = new SettingsOptions();

    //   console.log(OptionsDto.server_info.max_execution_time)
    //     settingOption.currency = OptionsDto.currency
    //     settingOption.currencyToWalletRatio = OptionsDto.currencyToWalletRatio
    //     settingOption.defaultAi = OptionsDto.defaultAi
    //     settingOption.defaultPaymentGateway = OptionsDto.defaultPaymentGateway
    //     settingOption.freeShipping = OptionsDto.freeShipping
    //     settingOption.freeShippingAmount = OptionsDto.freeShippingAmount
    //     settingOption.guestCheckout = OptionsDto.guestCheckout
    //     settingOption.isProductReview = OptionsDto.isProductReview
    //     settingOption.maximumQuestionLimit = OptionsDto.maximumQuestionLimit
    //     settingOption.maxShopDistance = OptionsDto.maxShopDistance
    //     settingOption.minimumOrderAmount = OptionsDto.minimumOrderAmount
    //     settingOption.shippingClass = OptionsDto.shippingClass
    //     settingOption.signupPoints = OptionsDto.signupPoints
    //     settingOption.siteSubtitle = OptionsDto.siteSubtitle
    //     settingOption.siteTitle = OptionsDto.siteTitle
    //     settingOption.StripeCardOnly = OptionsDto.StripeCardOnly
    //     settingOption.taxClass = OptionsDto.taxClass
    //     settingOption.useAi = OptionsDto.useAi
    //     settingOption.useCashOnDelivery = OptionsDto.useCashOnDelivery
    //     settingOption.useEnableGateway = OptionsDto.useEnableGateway
    //     settingOption.useGoogleMap = OptionsDto.useGoogleMap
    //     settingOption.useMustVerifyEmail = OptionsDto.useMustVerifyEmail
    //     settingOption.useOtp = OptionsDto.useOtp
    //     console.log(settingOption)
    //     const Options = await this.settingOpsionsRepository.save(settingOption)
    //     if(OptionsDto.seo){
    //       const seoDto = OptionsDto.seo
    //       const optionSeo = new SeoSettings();
    //       optionSeo.metaTitle = seoDto.metaTitle
    //       optionSeo.metaDescription = seoDto.metaDescription
    //       optionSeo.ogTitle = seoDto.ogTitle
    //       optionSeo.ogDescription = seoDto.ogDescription
    //       optionSeo.twitterHandle = seoDto.twitterHandle
    //       optionSeo.twitterCardType =seoDto.twitterCardType
    //       optionSeo.metaTags = seoDto.metaTags
    //       optionSeo.canonicalUrl = seoDto.canonicalUrl
    //       const OptionSeo = await this.seoSettingRepository.save(optionSeo)
    //       console.log(OptionSeo)
    //       settingOption.seo = OptionSeo
    //     }
    //     if(OptionsDto.emailEvent){
    //       const emailEventDto = OptionsDto.emailEvent
    //       if(emailEventDto.admin){
    //         const emailAdminDto = emailEventDto.admin
    //         const emailAdmin = new EmailAdmin()
    //         emailAdmin.paymentOrder = emailAdminDto.paymentOrder
    //         emailAdmin.refundOrder = emailAdminDto.refundOrder
    //         emailAdmin.statusChangeOrder = emailAdminDto.statusChangeOrder
    //         const emailAdmins =  await this.emailAdminRepository.save(emailAdmin)
    //         emailEventDto.admin = emailAdmins
    //       }
    //       if(emailEventDto.vendor){
    //         const emailVendorDto = emailEventDto.vendor
    //         const emailVendor = new EmailVendor()
    //         emailVendor.refundOrder = emailVendorDto.refundOrder
    //         emailVendor.createQuestion = emailVendorDto.createQuestion
    //         emailVendor.createReview = emailVendorDto.createReview
    //         emailVendor.statusChangeOrder = emailVendorDto.statusChangeOrder
    //         emailVendor.paymentOrder = emailVendorDto.paymentOrder

    //         const EmailVendors =  await this.emailVendorRepository.save(emailVendor)
    //         emailEventDto.vendor = EmailVendors
    //       }
    //       if(emailEventDto.customer){
    //         const emailCustomerDto = emailEventDto.customer
    //         const customer = new EmailCustomer()
    //         customer.answerQuestion = emailCustomerDto.answerQuestion
    //         customer.paymentOrder = emailCustomerDto.paymentOrder
    //         customer.refundOrder = emailCustomerDto.refundOrder
    //         customer.statusChangeOrder = emailCustomerDto.statusChangeOrder

    //         const emailCustomer = await this.emailCustomerRepository.save(customer)
    //         emailEventDto.customer = emailCustomer
    //       }
    //     }
    //     if(OptionsDto.server_info){
    //       const serverInfoDTO = OptionsDto.server_info
    //       const optionServerInfo= new ServerInfo()
    //       optionServerInfo.max_execution_time = serverInfoDTO.max_execution_time
    //       optionServerInfo.max_input_time = serverInfoDTO.max_input_time
    //       optionServerInfo.memory_limit = serverInfoDTO.memory_limit
    //       optionServerInfo.post_max_size = serverInfoDTO.post_max_size
    //       optionServerInfo.upload_max_filesize = serverInfoDTO.upload_max_filesize
    //       const OptionsServerInfo = await this.serverInfoRepository.save(optionServerInfo)
    //       console.log(OptionsServerInfo)
    //       settingOption.server_info = OptionsServerInfo
    //     }
    //     if (Array.isArray(OptionsDto.deliveryTime) && OptionsDto.deliveryTime.length > 0) {
    //       const deliverTimeData = await Promise.all(OptionsDto.deliveryTime.map(async (optionDeliveryTime) => {
    //         const deliveryTime = new DeliveryTime();
    //         deliveryTime.title = optionDeliveryTime.title;
    //         deliveryTime.description = optionDeliveryTime.description;
    //        await this.deliveryTimeRepository.save(deliveryTime);
    //       }));
    //       console.log(deliverTimeData)
        
    //       // settingOption.deliveryTime = deliverTimeData;
    //     }

    //     if (OptionsDto.contactDetails) {
    //       const { contactDetails } = OptionsDto;
    //       const contact = new ContactDetails();
    //       contact.contact = contactDetails.contact;
    //       contact.website = contactDetails.website;

    //       if (Array.isArray(contactDetails.socials) && contactDetails.socials.length > 0) {
    //         const socials = await Promise.all(
    //           contactDetails.socials.map(async (social) => {
    //             console.log(social);
    //             const shopSocial = new ShopSocials();
    //             shopSocial.url = social.url;
    //             shopSocial.icon = social.icon;
        
    //             return await this.shopSocialsRepository.save(shopSocial);
    //           })
    //         );
        
    //         contact.socials = socials;
    //       }
        
    //       if (contactDetails.location) {
    //         const locationDto = contactDetails.location;
    //         const location = new Location();
    //         const { lat, lng, zip, city, state, country, formattedAddress } = locationDto;
    //         location.lat = lat;
    //         location.lng = lng;
    //         location.zip = zip;
    //         location.city = city;
    //         location.state = state;
    //         location.country = country;
    //         location.formattedAddress = formattedAddress;
        
    //         const contactLocation = await this.locationRepository.save(location);
    //         contact.location = contactLocation;
    //       }
        
    //       const optionsContact = await this.contactRepository.save(contact);
    //       console.log(optionsContact);
    //       settingOption.contactDetails = optionsContact;
    //     }
        

    //     if (Array.isArray(OptionsDto.paymentGateway) && OptionsDto.paymentGateway.length>0){
    //       const Payment = await Promise.all(OptionsDto.paymentGateway.map(async (paymentDto)=>{
    //         const payment = new PaymentGateway()
    //         payment.name = paymentDto.name
    //         payment.title = paymentDto.title

    //         return await this.paymentRepository.save(payment)
    //       }))
    //       console.log(Payment)
    //       settingOption.paymentGateway = Payment
    //     }

    //     if(OptionsDto.currencyOptions){
    //       const currencyDto = OptionsDto.currencyOptions
    //       const currency = new CurrencyOptions()
    //       currency.formation = currencyDto.formation
    //       currency.fractions = currencyDto.fractions

    //       const Currency = await this.currencyRepository.save(currency)
    //       console.log(Currency)
    //       settingOption.currencyOptions = Currency
    //     }

    //     if(OptionsDto.logo){
    //       const logoDto = OptionsDto.logo
    //       const logo = new LogoSettings()
    //       logo.original = logoDto.original
    //       logo.thumbnail = logoDto.thumbnail

    //       const Logo = await this.LogoSettingsRepository.save(logo)
    //       console.log(Logo)
    //       settingOption.logo = Logo
    //     }



    //     setting.options = Options
    //     console.log(Options)
    // }
   


    
    // console.log(setting)
    // console.log(createSettingDto.options.server_info)
  return 
    // return this.settings;

  }

  findAll() {
    return this.settings
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    return this.settings
  }

  remove(id: number) {
    return `This action removes a #${id} setting`
  }
}

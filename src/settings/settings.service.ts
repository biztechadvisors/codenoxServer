/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateSettingDto } from './dto/create-setting.dto'
import { UpdateSettingDto } from './dto/update-setting.dto'
import {
  ContactDetails,
  CurrencyOptions,
  DeliveryTime,
  EmailAdmin,
  EmailCustomer,
  EmailEvent,
  EmailVendor,
  Location,
  LogoSettings,
  PaymentGateway,
  SeoSettings,
  ServerInfo,
  Setting,
  SettingsOptions,
  ShopSocials,
  SmsAdmin,
  SmsCustomer,
  SmsEvent,
  SmsVendor
} from './entities/setting.entity'
import { InjectRepository } from '@nestjs/typeorm'
import {
  ContactDetailsRepository,
  CurrencyOptionsRepository,
  DeliveryTimeRepository,
  EmailAdminRepository,
  EmailCustomerRepository,
  EmailEventRepository,
  EmailVendorRepository,
  LogoSettingsRepository,
  PaymentGateWayRepository,
  SeoSettingsRepository,
  ServerInfoRepository,
  SettingRepository,
  SettingsOptionsRepository,
  SmsAdminRepository,
  SmsCustomerRepository,
  SmsEventRepository,
  SmsVendorRepository
} from './settings.repository'
import { LocationRepository, ShopSocialsRepository } from 'src/shops/shops.repository'
import { AttachmentRepository } from 'src/common/common.repository'



@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingRepository)
    private settingRepository: SettingRepository,
    @InjectRepository(SettingsOptionsRepository)
    private settingsOptionsRepository: SettingsOptionsRepository,
    @InjectRepository(ContactDetailsRepository)
    private contactDetailRepository: ContactDetailsRepository,
    @InjectRepository(LocationRepository)
    private locationRepository: LocationRepository,
    @InjectRepository(ShopSocialsRepository)
    private shopSocialRepository: ShopSocialsRepository,
    @InjectRepository(CurrencyOptionsRepository)
    private currencyOptionRepository: CurrencyOptionsRepository,
    @InjectRepository(EmailEventRepository)
    private emailEventRepository: EmailEventRepository,
    @InjectRepository(EmailAdminRepository)
    private emailAdminRepository: EmailAdminRepository,
    @InjectRepository(EmailVendorRepository)
    private emailVendorRepository: EmailVendorRepository,
    @InjectRepository(EmailCustomerRepository)
    private emailCustomerRepository: EmailCustomerRepository,
    @InjectRepository(SmsEventRepository)
    private smsEventRepository: SmsEventRepository,
    @InjectRepository(SmsAdminRepository)
    private smsAdminRepository: SmsAdminRepository,
    @InjectRepository(SmsVendorRepository)
    private smsVendorRepository: SmsVendorRepository,
    @InjectRepository(SmsCustomerRepository)
    private smsCustomerRepository: SmsCustomerRepository,
    @InjectRepository(SeoSettingsRepository)
    private seoSettingsRepository: SeoSettingsRepository,
    @InjectRepository(ServerInfoRepository)
    private serverInfoRepository: ServerInfoRepository,
    @InjectRepository(DeliveryTimeRepository)
    private deliveryTimeRepository: DeliveryTimeRepository,
    @InjectRepository(LogoSettingsRepository)
    private logoSettingsRepository: LogoSettingsRepository,
    @InjectRepository(PaymentGateWayRepository)
    private paymentGatewayRepository: PaymentGateWayRepository,
    @InjectRepository(AttachmentRepository)
    private attachmentRepository: AttachmentRepository,
  ) { }

  async create(id: number, createSettingDto: CreateSettingDto): Promise<Setting> {
    try {
      const existingSetting = await this.settingRepository.findOne({ where: { id: id } });

      if (existingSetting) {
        await this.update(id, createSettingDto);
        return existingSetting;
      }

      const newSettings = new Setting();
      newSettings.created_at = new Date();
      newSettings.language = createSettingDto.language;
      newSettings.translated_languages = createSettingDto.translated_languages;
      newSettings.updated_at = new Date();

      const newOptions = new SettingsOptions();
      const [location, currencyId, emailId, smsId, seoId, serverInfoId, logoId, option] = await Promise.all([
        createSettingDto.options.contactDetails
          ? this.saveContactDetails(createSettingDto.options.contactDetails)
          : null,
        createSettingDto.options.currencyOptions
          ? this.saveCurrencyOptions(createSettingDto.options.currencyOptions)
          : null,
        createSettingDto.options.emailEvent
          ? this.saveEmailEvent(createSettingDto.options.emailEvent)
          : null,
        createSettingDto.options.smsEvent
          ? this.saveSmsEvent(createSettingDto.options.smsEvent)
          : null,
        createSettingDto.options.seo
          ? this.saveSeoSettings(createSettingDto.options.seo)
          : null,
        createSettingDto.options.server_info
          ? this.saveServerInfo(createSettingDto.options.server_info)
          : null,
        createSettingDto.options.logo
          ? this.saveLogoSettings(createSettingDto.options.logo)
          : null,
        createSettingDto.options.paymentGateway
          ? this.savePaymentGateway(createSettingDto.options.paymentGateway)
          : null,
      ]);

      newOptions.contactDetails = location;
      newOptions.emailEvent = emailId;
      newOptions.currencyOptions = currencyId;
      newOptions.smsEvent = smsId;
      newOptions.seo = seoId;
      newOptions.server_info = serverInfoId;
      newOptions.logo = logoId;
      newOptions.paymentGateway = option.paymentGateway;

      const savedOptions = await this.settingsOptionsRepository.save(newOptions);
      newSettings.options = savedOptions;

      const savedSetting = await this.settingRepository.save(newSettings);
      return savedSetting;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async savePaymentGateway(paymentGateway: PaymentGateway[]): Promise<any> {
    try {
      return await this.paymentGatewayRepository.save(paymentGateway);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveContactDetails(contactDetails: any): Promise<ContactDetails> {
    try {
      return await this.contactDetailRepository.save(contactDetails);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveCurrencyOptions(currencyOptions: any): Promise<CurrencyOptions> {
    try {
      return await this.currencyOptionRepository.save(currencyOptions);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveEmailEvent(emailEvent: any): Promise<EmailEvent> {
    try {

      return await this.emailEventRepository.save(emailEvent);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveSmsEvent(smsEvent: any): Promise<SmsEvent> {
    try {

      return await this.smsEventRepository.save(smsEvent);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveSeoSettings(seoSettings: any): Promise<SeoSettings> {
    try {
      return await this.seoSettingsRepository.save(seoSettings);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveServerInfo(serverInfo: any): Promise<ServerInfo> {
    try {

      return await this.serverInfoRepository.save(serverInfo);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveLogoSettings(logoSettings: any): Promise<LogoSettings> {
    try {
    
      return await this.logoSettingsRepository.save(logoSettings);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  // //create setting
  // async create(id: number, createSettingDto: CreateSettingDto): Promise<Setting> {
  //   let value4: any
  //   let value5: any
  //   let value6: any
  //   let value7: any
  //   let value8: any
  //   let value9: any
  //   let value10: any
  //   let value11: any
  //   let value12: any
  //   let value13: any
  //   let value14: any
  //   let value15: any
  //   let value16: any
  //   let value17: any
  //   let value18: any

  //   const newSettings = new Setting()
  //   const newOptions = new SettingsOptions()
  //   try {
  //     const existingSetting = await this.settingRepository.find()
  //     if (existingSetting) {
  //       await this.update(id, createSettingDto)
  //     } else {
  //       newSettings.created_at = new Date()
  //       newSettings.language = createSettingDto.language
  //       newSettings.translated_languages = createSettingDto.translated_languages
  //       newSettings.updated_at = new Date()
  //       // const setting = await this.settingRepository.save(newSettings)
  //       //options
  //       if (createSettingDto.options) {
  //         newOptions.currency = createSettingDto.options.currency
  //         newOptions.currencyToWalletRatio = createSettingDto.options.currencyToWalletRatio
  //         newOptions.freeShipping = createSettingDto.options.freeShipping
  //         newOptions.freeShippingAmount = createSettingDto.options.freeShippingAmount ? createSettingDto.options.freeShippingAmount : null
  //         newOptions.guestCheckout = createSettingDto.options.guestCheckout
  //         newOptions.defaultAi = createSettingDto.options.defaultAi
  //         newOptions.defaultPaymentGateway = createSettingDto.options.defaultPaymentGateway
  //         newOptions.isProductReview = createSettingDto.options.isProductReview
  //         newOptions.maximumQuestionLimit = createSettingDto.options.maximumQuestionLimit
  //         newOptions.maxShopDistance = createSettingDto.options.maxShopDistance
  //         newOptions.minimumOrderAmount = createSettingDto.options.minimumOrderAmount
  //         newOptions.shippingClass = createSettingDto.options.shippingClass
  //         newOptions.signupPoints = createSettingDto.options.signupPoints
  //         newOptions.siteSubtitle = createSettingDto.options.siteSubtitle
  //         newOptions.siteTitle = createSettingDto.options.siteTitle
  //         newOptions.StripeCardOnly = createSettingDto.options.StripeCardOnly
  //         newOptions.taxClass = createSettingDto.options.taxClass
  //         newOptions.useAi = createSettingDto.options.useAi
  //         newOptions.useCashOnDelivery = createSettingDto.options.useCashOnDelivery
  //         newOptions.useEnableGateway = createSettingDto.options.useEnableGateway
  //         newOptions.useGoogleMap = createSettingDto.options.useGoogleMap
  //         newOptions.useMustVerifyEmail = createSettingDto.options.useMustVerifyEmail
  //         newOptions.useOtp = createSettingDto.options.useOtp
  //         newOptions.created_at = new Date()
  //         newOptions.updated_at = new Date()
  //         //contact Detail
  //         if (createSettingDto.options.contactDetails) {
  //           const newcontact = new ContactDetails()
  //           newcontact.contact = createSettingDto.options.contactDetails.contact
  //           newcontact.website = createSettingDto.options.contactDetails.website
  //           if (createSettingDto.options.contactDetails.location) {
  //             const newLocation = new Location()
  //             newLocation.lat = createSettingDto.options.contactDetails.location.lat ? createSettingDto.options.contactDetails.location.lat : null
  //             newLocation.lng = createSettingDto.options.contactDetails.location.lng ? createSettingDto.options.contactDetails.location.lng : null
  //             newLocation.city = createSettingDto.options.contactDetails.location.city ? createSettingDto.options.contactDetails.location.city : null
  //             newLocation.state = createSettingDto.options.contactDetails.location.state ? createSettingDto.options.contactDetails.location.state : null
  //             newLocation.zip = createSettingDto.options.contactDetails.location.zip ? createSettingDto.options.contactDetails.location.zip : null
  //             newLocation.country = createSettingDto.options.contactDetails.location.country ? createSettingDto.options.contactDetails.location.country : null
  //             newLocation.formattedAddress = createSettingDto.options.contactDetails.location.formattedAddress ? createSettingDto.options.contactDetails.location.formattedAddress : null
  //             // const newLocation = createSettingDto.options.contactDetails.location
  //             const locations = await this.locationRepository.save(newLocation)
  //             value6 = locations
  //           }
  //           if (createSettingDto.options.contactDetails.socials) {
  //             const socials: ShopSocials[] = [];
  //             for (const social of createSettingDto.options.contactDetails.socials) {
  //               const newSocial = this.shopSocialRepository.create(social)
  //               const socialId = await this.shopSocialRepository.save(newSocial)
  //               socials.push(socialId);
  //             }
  //             newcontact.socials = socials
  //           }
  //           newcontact.location = value6
  //           const contacts = await this.contactDetailRepository.save(newcontact)
  //           const socialIds = contacts.socials.map((social) => social.id);
  //           value5 = contacts.id
  //         }
  //         //curremcy Option
  //         if (createSettingDto.options.currencyOptions) {
  //           const newCurrency = new CurrencyOptions()
  //           newCurrency.formation = createSettingDto.options.currencyOptions.formation
  //           newCurrency.fractions = createSettingDto.options.currencyOptions.fractions
  //           const currencyId = await this.currencyOptionRepository.save(newCurrency)
  //           value7 = currencyId.id
  //         }
  //         //Email Event
  //         if (createSettingDto.options.emailEvent) {
  //           const newEmail = new EmailEvent()
  //           if (createSettingDto.options.emailEvent.admin) {
  //             const newAdmin = new EmailAdmin()
  //             newAdmin.paymentOrder = createSettingDto.options.emailEvent.admin.paymentOrder
  //             newAdmin.refundOrder = createSettingDto.options.emailEvent.admin.refundOrder
  //             newAdmin.statusChangeOrder = createSettingDto.options.emailEvent.admin.statusChangeOrder
  //             const adminId = await this.emailAdminRepository.save(newAdmin)
  //             value9 = adminId.id
  //           }
  //           if (createSettingDto.options.emailEvent.vendor) {
  //             const newVendor = new EmailVendor()
  //             newVendor.paymentOrder = createSettingDto.options.emailEvent.vendor.paymentOrder
  //             newVendor.refundOrder = createSettingDto.options.emailEvent.vendor.refundOrder
  //             newVendor.statusChangeOrder = createSettingDto.options.emailEvent.vendor.statusChangeOrder
  //             newVendor.createQuestion = createSettingDto.options.emailEvent.vendor.createQuestion
  //             newVendor.createReview = createSettingDto.options.emailEvent.vendor.createReview
  //             const vendorId = await this.emailVendorRepository.save(newVendor)
  //             value10 = vendorId.id
  //           }
  //           if (createSettingDto.options.emailEvent.customer) {
  //             const newCustomer = new EmailCustomer()
  //             newCustomer.paymentOrder = createSettingDto.options.emailEvent.customer.paymentOrder
  //             newCustomer.refundOrder = createSettingDto.options.emailEvent.customer.refundOrder
  //             newCustomer.statusChangeOrder = createSettingDto.options.emailEvent.customer.statusChangeOrder
  //             newCustomer.answerQuestion = createSettingDto.options.emailEvent.customer.answerQuestion
  //             const customerId = await this.emailCustomerRepository.save(newCustomer)
  //             value11 = customerId.id
  //           }
  //           newEmail.admin = value9
  //           newEmail.vendor = value10
  //           newEmail.customer = value11
  //           const emailId = await this.emailEventRepository.save(newEmail)
  //           value8 = emailId.id
  //         }
  //         //sms Event
  //         if (createSettingDto.options.smsEvent) {
  //           const newSms = new SmsEvent()
  //           if (createSettingDto.options.smsEvent.admin) {
  //             const newSmsAdmin = new SmsAdmin()
  //             newSmsAdmin.paymentOrder = createSettingDto.options.smsEvent.admin.paymentOrder
  //             newSmsAdmin.refundOrder = createSettingDto.options.smsEvent.admin.refundOrder
  //             newSmsAdmin.statusChangeOrder = createSettingDto.options.smsEvent.admin.statusChangeOrder
  //             const smsAdminId = await this.smsAdminRepository.save(newSmsAdmin)
  //             value12 = smsAdminId.id
  //           }
  //           if (createSettingDto.options.smsEvent.vendor) {
  //             const newSmsVendor = new SmsVendor()
  //             newSmsVendor.paymentOrder = createSettingDto.options.smsEvent.vendor.paymentOrder
  //             newSmsVendor.refundOrder = createSettingDto.options.smsEvent.vendor.refundOrder
  //             newSmsVendor.statusChangeOrder = createSettingDto.options.smsEvent.vendor.statusChangeOrder
  //             const smsVendorId = await this.smsVendorRepository.save(newSmsVendor)
  //             value13 = smsVendorId.id
  //           }
  //           if (createSettingDto.options.smsEvent.customer) {
  //             const newSmsCustomer = new SmsCustomer()
  //             newSmsCustomer.paymentOrder = createSettingDto.options.smsEvent.customer.paymentOrder
  //             newSmsCustomer.refundOrder = createSettingDto.options.smsEvent.customer.refundOrder
  //             newSmsCustomer.statusChangeOrder = createSettingDto.options.smsEvent.customer.statusChangeOrder
  //             const smsCustomerId = await this.smsCustomerRepository.save(newSmsCustomer)
  //             value14 = smsCustomerId.id
  //           }
  //           newSms.admin = value12
  //           newSms.vendor = value13
  //           newSms.customer = value14
  //           const smsId = await this.smsEventRepository.save(newSms)
  //           value15 = smsId.id
  //         }
  //         //seo Setting
  //         if (createSettingDto.options.seo) {
  //           try {
  //             const newSeo = new SeoSettings()
  //             newSeo.ogImage = createSettingDto.options.seo.ogImage ? createSettingDto.options.seo.ogImage : null
  //             newSeo.ogTitle = createSettingDto.options.seo.ogTitle ? createSettingDto.options.seo.ogTitle : null
  //             newSeo.ogDescription = createSettingDto.options.seo.ogDescription ? createSettingDto.options.seo.ogDescription : null
  //             newSeo.metaTitle = createSettingDto.options.seo.metaTitle ? createSettingDto.options.seo.metaTitle : null
  //             newSeo.metaDescription = createSettingDto.options.seo.metaDescription ? createSettingDto.options.seo.metaDescription : null
  //             newSeo.metaTags = createSettingDto.options.seo.metaTags ? createSettingDto.options.seo.metaTags : null
  //             newSeo.twitterCardType = createSettingDto.options.seo.twitterCardType ? createSettingDto.options.seo.twitterCardType : null
  //             newSeo.twitterHandle = createSettingDto.options.seo.twitterHandle ? createSettingDto.options.seo.twitterHandle : null
  //             newSeo.canonicalUrl = createSettingDto.options.seo.canonicalUrl ? createSettingDto.options.seo.canonicalUrl : null
  //             const seoId = await this.seoSettingsRepository.save(newSeo)
  //             value16 = seoId.id
  //           } catch (error) {
  //             console.error("Error saving SEO:", error);
  //           }
  //         }
  //         // serverInfo
  //         if (createSettingDto.options.server_info) {
  //           const newServerInfo = new ServerInfo()
  //           newServerInfo.max_execution_time = createSettingDto.options.server_info.max_execution_time
  //           newServerInfo.max_input_time = createSettingDto.options.server_info.max_input_time
  //           newServerInfo.memory_limit = createSettingDto.options.server_info.memory_limit
  //           newServerInfo.post_max_size = createSettingDto.options.server_info.post_max_size
  //           newServerInfo.upload_max_filesize = createSettingDto.options.server_info.upload_max_filesize
  //           const serverInfoId = await this.serverInfoRepository.save(newServerInfo)
  //           value17 = serverInfoId.id
  //         }
  //         //delivery Time
  //         if (createSettingDto.options.deliveryTime) {
  //           try {
  //             const newDeliveryTime: DeliveryTime[] = []
  //             for (const delivery of createSettingDto.options.deliveryTime) {
  //               const newDelivery = this.deliveryTimeRepository.create(delivery)
  //               const deliveryTimeId = await this.deliveryTimeRepository.save(newDelivery)
  //               newDeliveryTime.push(deliveryTimeId);
  //             }
  //             newOptions.deliveryTime = newDeliveryTime
  //           } catch (error) {
  //             console.error("Error saving DeliveryTime:", error);
  //           }
  //         }
  //         //logo
  //         if (createSettingDto.options.logo) {
  //           try {
  //             const newLogo = new LogoSettings()
  //             newLogo.original = createSettingDto.options.logo.original
  //             newLogo.thumbnail = createSettingDto.options.logo.thumbnail
  //             const logoId = await this.logoSettingsRepository.save(newLogo)
  //             value18 = logoId.id
  //           } catch (error) {
  //             console.error("Error saving logo:", error);
  //           }
  //         }
  //         //paymentGateway
  //         if (createSettingDto.options.paymentGateway) {
  //           try {
  //             const newPaymentGateway: PaymentGateway[] = []
  //             for (const payment of createSettingDto.options.paymentGateway) {
  //               const newPayment = this.paymentGatewayRepository.create(payment)
  //               const paymentGatewayId = await this.paymentGatewayRepository.save(newPayment)
  //               newPaymentGateway.push(paymentGatewayId);
  //             }
  //             newOptions.paymentGateway = newPaymentGateway
  //           } catch (error) {
  //             console.error("Error saving PaymentGateway:", error);
  //           }
  //         }
  //         //option table insertion
  //         newOptions.contactDetails = value5
  //         newOptions.emailEvent = value8
  //         newOptions.currencyOptions = value7
  //         newOptions.smsEvent = value15
  //         newOptions.seo = value16
  //         newOptions.server_info = value17
  //         newOptions.logo = value18
  //         const option = await this.settingsOptionsRepository.save(newOptions)
  //         const deliveryIds = option.deliveryTime.map((delivery) => delivery.id);
  //         const paymentGateWayIds = option.paymentGateway.map((gateway) => gateway.id);
  //         value4 = option
  //       }
  //       //setting table insertion
  //       newSettings.options = value4
  //       const setting = await this.settingRepository.save(newSettings)
  //       return setting
  //     }
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  //find all settings
  async findAll() {
    const settingData = await this.settingRepository.find({
      relations: [
        'options.contactDetails',
        'options.contactDetails.socials',
        'options.contactDetails.location',
        'options.currencyOptions',
        'options.emailEvent',
        'options.emailEvent.admin',
        'options.emailEvent.vendor',
        'options.emailEvent.customer',
        'options.smsEvent',
        'options.smsEvent.admin',
        'options.smsEvent.vendor',
        'options.smsEvent.customer',
        'options.seo',
        'options.seo.ogImage',
        'options.deliveryTime',
        'options.paymentGateway',
        'options.logo',
      ],
    });

    if (!settingData || settingData.length === 0) {
      return null;
    } else {
      for (let index = 0; index < settingData.length; index++) {
        const setting = settingData[index];
        return setting;
      }

      // const settingsArray = settingData.map((setting) => {
      //   return {
      //     id: setting.id,
      //     options: {
      //       siteTitle: setting.options.siteTitle,
      //       siteSubtitle: setting.options.siteSubtitle,
      //       minimumOrderAmount: setting.options.minimumOrderAmount,
      //       currencyToWalletRatio: setting.options.currencyToWalletRatio,
      //       signupPoints: setting.options.signupPoints,
      //       maximumQuestionLimit: setting.options.maximumQuestionLimit,
      //       seo: setting.options.seo
      //         ? {
      //             ogImage: setting.options.seo.ogImage,
      //             ogTitle: setting.options.seo.ogTitle,
      //             metaTags: setting.options.seo.metaTags,
      //             metaTitle: setting.options.seo.metaTitle,
      //             canonicalUrl: setting.options.seo.canonicalUrl,
      //             ogDescription: setting.options.seo.ogDescription,
      //             twitterHandle: setting.options.seo.twitterHandle,
      //             metaDescription: setting.options.seo.metaDescription,
      //             twitterCardType: setting.options.seo.twitterCardType,
      //           }
      //         : null,
      //       logo: setting.options.logo
      //         ? {
      //             id: setting.options.logo.id,
      //             original: setting.options.logo.original,
      //             thumbnail: setting.options.logo.thumbnail,
      //           }
      //         : null,
      //       useAi: setting.options.useAi,
      //       useOtp: setting.options.useOtp,
      //       currency: setting.options.currency,
      //       smsEvent: setting.options.smsEvent,
      //       taxClass: setting.options.taxClass,
      //       defaultAi: setting.options.defaultAi,
      //       emailEvent: setting.options.emailEvent,
      //       server_info: setting.options.server_info,
      //       deliveryTime: setting.options.deliveryTime,
      //       freeShipping: setting.options.freeShipping,
      //       useGoogleMap: setting.options.useGoogleMap,
      //       guestCheckout: setting.options.guestCheckout,
      //       shippingClass: setting.options.shippingClass,
      //       StripeCardOnly: setting.options.StripeCardOnly,
      //       contactDetails: setting.options.contactDetails
      //         ? {
      //             contact: setting.options.contactDetails.contact,
      //             socials: setting.options.contactDetails.socials,
      //             website: setting.options.contactDetails.website,
      //             location: setting.options.contactDetails.location,
      //           }
      //         : null,
      //       paymentGateway: setting.options.paymentGateway,
      //       currencyOptions: setting.options.currencyOptions,
      //       isProductReview: setting.options.isProductReview,
      //       maxShopDistance: setting.options.maxShopDistance,
      //       useEnableGateway: setting.options.useEnableGateway,
      //       useCashOnDelivery: setting.options.useCashOnDelivery,
      //       freeShippingAmount: setting.options.freeShippingAmount,
      //       useMustVerifyEmail: setting.options.useMustVerifyEmail,
      //       defaultPaymentGateway: setting.options.defaultPaymentGateway,
      //     },
      //     language: setting.language,
      //     created_at: setting.created_at,
      //     updated_at: setting.updated_at,
      //   };
      // });

      // return settingsArray;

    }
  }

  // Find one setting
  async findOne(id: number, shop_id: number) {
    const settingData = await this.settingRepository.findOne({
      where: { id: id, shop: { id: shop_id } },
      relations: [
        'shop',  // Include shop relation if needed
        'options.contactDetails',
        'options.contactDetails.socials',
        'options.contactDetails.location',
        'options.currencyOptions',
        'options.emailEvent',
        'options.emailEvent.admin',
        'options.emailEvent.vendor',
        'options.emailEvent.customer',
        'options.smsEvent',
        'options.smsEvent.admin',
        'options.smsEvent.vendor',
        'options.smsEvent.customer',
        'options.seo',
        'options.seo.ogImage',
        'options.deliveryTime',
        'options.paymentGateway',
        'options.logo',
      ]
    });

    if (!settingData) {
      return null;
    } else {
      return settingData;
    }
  }

  //update setting
  async update(id: number, updateSettingDto: UpdateSettingDto) {
    try {
      const findSetting = await this.settingRepository.find({
        where: { id: id },
        relations: [
          'options.contactDetails',
          'options.contactDetails.socials',
          'options.contactDetails.location',
          'options.currencyOptions',
          'options.emailEvent',
          'options.emailEvent.admin',
          'options.emailEvent.vendor',
          'options.emailEvent.customer',
          'options.smsEvent',
          'options.smsEvent.admin',
          'options.smsEvent.vendor',
          'options.smsEvent.customer',
          'options.seo',
          'options.seo.ogImage',
          'options.server_info',
          'options.deliveryTime',
          'options.paymentGateway',
          'options.logo',
        ]
      })

      if (findSetting) {

        for (let index = 0; index < findSetting.length; index++) {
          const setting = findSetting[index];
          setting.language = updateSettingDto.language
          setting.translated_languages = updateSettingDto.translated_languages
          setting.updated_at = new Date()

          //update Options
          if (updateSettingDto.options) {
            // let valueId: any
            const findOption = await this.settingsOptionsRepository.findOne({
              where: { id: setting.options.id },
              relations: [
                'contactDetails',
                'currencyOptions',
                'emailEvent',
                'smsEvent',
                'seo',
                'server_info',
                'deliveryTime',
                'paymentGateway',
                'logo'
              ]
            })

            findOption.currency = updateSettingDto.options.currency
            findOption.currencyToWalletRatio = updateSettingDto.options.currencyToWalletRatio
            findOption.freeShipping = updateSettingDto.options.freeShipping
            findOption.freeShippingAmount = updateSettingDto.options.freeShippingAmount ? updateSettingDto.options.freeShippingAmount : null
            findOption.guestCheckout = updateSettingDto.options.guestCheckout
            findOption.defaultAi = updateSettingDto.options.defaultAi
            findOption.defaultPaymentGateway = updateSettingDto.options.defaultPaymentGateway
            findOption.isProductReview = updateSettingDto.options.isProductReview
            findOption.maximumQuestionLimit = updateSettingDto.options.maximumQuestionLimit
            findOption.maxShopDistance = updateSettingDto.options.maxShopDistance
            findOption.minimumOrderAmount = updateSettingDto.options.minimumOrderAmount
            findOption.shippingClass = updateSettingDto.options.shippingClass
            findOption.signupPoints = updateSettingDto.options.signupPoints
            findOption.siteSubtitle = updateSettingDto.options.siteSubtitle
            findOption.siteTitle = updateSettingDto.options.siteTitle
            findOption.StripeCardOnly = updateSettingDto.options.StripeCardOnly
            findOption.taxClass = updateSettingDto.options.taxClass
            findOption.useAi = updateSettingDto.options.useAi
            findOption.useCashOnDelivery = updateSettingDto.options.useCashOnDelivery
            findOption.useEnableGateway = updateSettingDto.options.useEnableGateway
            findOption.useGoogleMap = updateSettingDto.options.useGoogleMap
            findOption.useMustVerifyEmail = updateSettingDto.options.useMustVerifyEmail
            findOption.useOtp = updateSettingDto.options.useOtp
            findOption.updated_at = new Date()

            //update contact Details
            if (updateSettingDto.options.contactDetails) {
              try {

                const updateContact = await this.contactDetailRepository.findOne({
                  where: { id: findOption.contactDetails.id },
                  relations: ['location', 'socials']
                })

                updateContact.contact = updateSettingDto.options.contactDetails.contact
                updateContact.website = updateSettingDto.options.contactDetails.website

                //update Contact detail location
                if (updateSettingDto.options.contactDetails.location) {

                  const updateLocation = await this.locationRepository.findOne({
                    where: { id: updateContact.location.id }
                  })

                  if (updateLocation) {

                    updateLocation.lat = updateSettingDto.options.contactDetails.location.lat
                    updateLocation.lng = updateSettingDto.options.contactDetails.location.lng
                    updateLocation.city = updateSettingDto.options.contactDetails.location.city
                    updateLocation.country = updateSettingDto.options.contactDetails.location.country
                    updateLocation.formattedAddress = updateSettingDto.options.contactDetails.location.formattedAddress
                    const final = await this.locationRepository.save(updateLocation)

                  }
                } else {
                  console.error("id not found")
                }

                // update Contact detail socials
                if (updateSettingDto.options.contactDetails.socials) {

                  const socials: ShopSocials[] = [];

                  for (const updateSocial of updateSettingDto.options.contactDetails.socials) {
                    const existingSocial = updateContact.socials.find(
                      (social) => social.icon === updateSocial.icon
                    );


                    if (existingSocial) {

                      const final = this.shopSocialRepository.create({ ...existingSocial, ...updateSocial })
                      const updatedSocial = await this.shopSocialRepository.save(final);

                      socials.push(updatedSocial);

                    } else {

                      const newSocial = this.shopSocialRepository.create({ ...updateSocial });
                      const savedSocial = await this.shopSocialRepository.save(newSocial);

                      socials.push(savedSocial);

                    }
                  }
                  updateContact.socials = socials;
                } else {
                  throw new NotFoundException("Invalid action Performed");
                }
                const contactfinal = await this.contactDetailRepository.save(updateContact)

              } catch (error) {
                console.log(error)
              }
            }

            //update currency options
            if (updateSettingDto.options.currencyOptions) {

              try {
                const updateCurency = await this.currencyOptionRepository.findOne({
                  where: { id: findOption.currencyOptions.id }
                })

                if (updateCurency) {
                  updateCurency.formation = updateSettingDto.options.currencyOptions.formation
                  updateCurency.fractions = updateSettingDto.options.currencyOptions.fractions

                  const updatedCurrencyOption = await this.currencyOptionRepository.save(updateCurency)

                }
              } catch (error) {
                console.log(error)
              }
            }

            //update email event
            if (updateSettingDto.options.emailEvent) {

              try {
                const updateEvent = await this.emailEventRepository.findOne({
                  where: { id: findOption.emailEvent.id },
                  relations: ['admin', 'vendor', 'customer']
                })

                if (updateEvent) {

                  //update email event admin
                  if (updateSettingDto.options.emailEvent.admin) {

                    const updateAdmin = await this.emailAdminRepository.findOne({
                      where: { id: updateEvent.admin.id }
                    })

                    updateAdmin.paymentOrder = updateSettingDto.options.emailEvent.admin.paymentOrder ? updateSettingDto.options.emailEvent.admin.paymentOrder : false
                    updateAdmin.refundOrder = updateSettingDto.options.emailEvent.admin.refundOrder ? updateSettingDto.options.emailEvent.admin.refundOrder : false
                    updateAdmin.statusChangeOrder = updateSettingDto.options.emailEvent.admin.statusChangeOrder ? updateSettingDto.options.emailEvent.admin.statusChangeOrder : false

                    await this.emailAdminRepository.save(updateAdmin)

                  } else {
                    console.log("No data found!")
                  }

                  //update email event vendor
                  if (updateSettingDto.options.emailEvent.vendor) {

                    const updateVendor = await this.emailVendorRepository.findOne({
                      where: { id: updateEvent.vendor.id }
                    })

                    updateVendor.paymentOrder = updateSettingDto.options.emailEvent.vendor.paymentOrder ? updateSettingDto.options.emailEvent.vendor.paymentOrder : false
                    updateVendor.refundOrder = updateSettingDto.options.emailEvent.vendor.refundOrder ? updateSettingDto.options.emailEvent.vendor.refundOrder : false
                    updateVendor.statusChangeOrder = updateSettingDto.options.emailEvent.vendor.statusChangeOrder ? updateSettingDto.options.emailEvent.vendor.statusChangeOrder : false
                    updateVendor.createQuestion = updateSettingDto.options.emailEvent.vendor.createQuestion ? updateSettingDto.options.emailEvent.vendor.createQuestion : false
                    updateVendor.createReview = updateSettingDto.options.emailEvent.vendor.createReview ? updateSettingDto.options.emailEvent.vendor.createReview : false

                    await this.emailVendorRepository.save(updateVendor)

                  } else {
                    console.log("No data found!")
                  }

                  //update email event customer
                  if (updateSettingDto.options.emailEvent.customer) {

                    const updateCustomer = await this.emailCustomerRepository.findOne({
                      where: { id: updateEvent.customer.id }
                    })

                    updateCustomer.paymentOrder = updateSettingDto.options.emailEvent.customer.paymentOrder ? updateSettingDto.options.emailEvent.customer.paymentOrder : false
                    updateCustomer.refundOrder = updateSettingDto.options.emailEvent.customer.refundOrder ? updateSettingDto.options.emailEvent.customer.refundOrder : false
                    updateCustomer.statusChangeOrder = updateSettingDto.options.emailEvent.customer.statusChangeOrder ? updateSettingDto.options.emailEvent.customer.statusChangeOrder : false
                    updateCustomer.answerQuestion = updateSettingDto.options.emailEvent.customer.answerQuestion ? updateSettingDto.options.emailEvent.customer.answerQuestion : false

                    await this.emailCustomerRepository.save(updateCustomer)

                  } else {
                    console.log("No data found!")
                  }
                }
              } catch (error) {
                console.log(error)
              }
            }

            //update sms event
            if (updateSettingDto.options.smsEvent) {

              try {
                const updateSms = await this.smsEventRepository.findOne({
                  where: { id: findOption.smsEvent.id },
                  relations: ['admin', 'vendor', 'customer']
                })

                if (updateSms) {

                  //update sms event admin
                  if (updateSettingDto.options.smsEvent.admin) {

                    const updateAdmin = await this.smsAdminRepository.findOne({
                      where: { id: updateSms.admin.id }
                    })

                    updateAdmin.paymentOrder = updateSettingDto.options.smsEvent.admin.paymentOrder ? updateSettingDto.options.smsEvent.admin.paymentOrder : false
                    updateAdmin.refundOrder = updateSettingDto.options.smsEvent.admin.refundOrder ? updateSettingDto.options.smsEvent.admin.refundOrder : false
                    updateAdmin.statusChangeOrder = updateSettingDto.options.smsEvent.admin.statusChangeOrder ? updateSettingDto.options.smsEvent.admin.statusChangeOrder : false

                    await this.smsAdminRepository.save(updateAdmin)

                  } else {
                    console.log("No data found!")
                  }

                  //update sms event vendor
                  if (updateSettingDto.options.smsEvent.vendor) {

                    const updateVendor = await this.smsVendorRepository.findOne({
                      where: { id: updateSms.vendor.id }
                    })

                    updateVendor.paymentOrder = updateSettingDto.options.smsEvent.vendor.paymentOrder ? updateSettingDto.options.smsEvent.vendor.paymentOrder : false
                    updateVendor.refundOrder = updateSettingDto.options.smsEvent.vendor.refundOrder ? updateSettingDto.options.smsEvent.vendor.refundOrder : false
                    updateVendor.statusChangeOrder = updateSettingDto.options.smsEvent.vendor.statusChangeOrder ? updateSettingDto.options.smsEvent.vendor.statusChangeOrder : false

                    await this.smsVendorRepository.save(updateVendor)

                  } else {
                    console.log("No data found!")
                  }

                  //update sms event customer
                  if (updateSettingDto.options.smsEvent.customer) {

                    const updateCustomer = await this.smsCustomerRepository.findOne({
                      where: { id: updateSms.customer.id }
                    })

                    updateCustomer.paymentOrder = updateSettingDto.options.smsEvent.customer.paymentOrder ? updateSettingDto.options.smsEvent.customer.paymentOrder : false
                    updateCustomer.refundOrder = updateSettingDto.options.smsEvent.customer.refundOrder ? updateSettingDto.options.smsEvent.customer.refundOrder : false
                    updateCustomer.statusChangeOrder = updateSettingDto.options.smsEvent.customer.statusChangeOrder ? updateSettingDto.options.smsEvent.customer.statusChangeOrder : false


                    await this.smsCustomerRepository.save(updateCustomer)

                  } else {
                    console.log("No data found!")
                  }
                }
              } catch (error) {
                console.log(error)
              }
            }

            //update seo
            if (updateSettingDto.options.seo) {
              try {

                const updateSeo = await this.seoSettingsRepository.findOne({
                  where: { id: findOption.seo.id },
                  relations: ['ogImage']
                })
                updateSeo.ogTitle = updateSettingDto.options.seo.ogTitle ? updateSettingDto.options.seo.ogTitle : null
                updateSeo.ogDescription = updateSettingDto.options.seo.ogDescription ? updateSettingDto.options.seo.ogDescription : null
                updateSeo.metaTitle = updateSettingDto.options.seo.metaTitle ? updateSettingDto.options.seo.metaTitle : null
                updateSeo.metaDescription = updateSettingDto.options.seo.metaDescription ? updateSettingDto.options.seo.metaDescription : null
                updateSeo.metaTags = updateSettingDto.options.seo.metaTags ? updateSettingDto.options.seo.metaTags : null
                updateSeo.twitterCardType = updateSettingDto.options.seo.twitterCardType ? updateSettingDto.options.seo.twitterCardType : null
                updateSeo.twitterHandle = updateSettingDto.options.seo.twitterHandle ? updateSettingDto.options.seo.twitterHandle : null
                updateSeo.canonicalUrl = updateSettingDto.options.seo.canonicalUrl ? updateSettingDto.options.seo.canonicalUrl : null

                //update seo Image
                // if(updateSettingDto.options.seo.ogImage){
                //   if(updateSeo.ogImage == null ){
                //     updateSeo.ogImage = updateSettingDto.options.seo.ogImage
                //   } else  {

                //    const ImgId = await this.attachmentRepository.findOne({
                //     where: { id: updateSeo.ogImage.id }
                //   })
                //   console.log("ImgIDdddddddddddddd", ImgId)

                //    updateSeo.ogImage = null
                //    const setNUl = await this.seoSettingsRepository.save(updateSeo)
                //    console.log("null", setNUl)
                //    const del = await this.attachmentRepository.delete(ImgId)
                //    console.log("delete", del)
                //   updateSeo.ogImage = updateSettingDto.options.seo.ogImage
                //   await this.seoSettingsRepository.save(updateSeo)
                // }
                // } 

                const seoId = await this.seoSettingsRepository.save(updateSeo)

              } catch (error) {
                console.error("Error saving SEO:", error);
              }
            }

            //update server info
            if (updateSettingDto.options.server_info) {

              try {

                const updateServerInfo = await this.serverInfoRepository.findOne({
                  where: { id: findOption.server_info.id }
                })

                if (updateServerInfo === null) {

                  const createServer = this.serverInfoRepository.create(updateSettingDto.options.server_info)
                  const insertedValue = await this.serverInfoRepository.save(createServer)

                  //  valueId = insertedValue.id
                } else {
                  updateServerInfo.max_execution_time = updateSettingDto.options.server_info.max_execution_time
                  updateServerInfo.max_input_time = updateSettingDto.options.server_info.max_input_time
                  updateServerInfo.memory_limit = updateSettingDto.options.server_info.memory_limit
                  updateServerInfo.post_max_size = updateSettingDto.options.server_info.post_max_size
                  updateServerInfo.upload_max_filesize = updateSettingDto.options.server_info.upload_max_filesize

                  const serverInfoId = await this.serverInfoRepository.save(updateServerInfo)

                }

              } catch (error) {
                console.log(error)
                throw new NotFoundException(error)
              }
            }

            //update delivery time
            if (updateSettingDto.options.deliveryTime) {

              try {

                const updateDeliveryTime: DeliveryTime[] = []

                for (const updates of updateSettingDto.options.deliveryTime) {
                  const existingTime = findOption.deliveryTime.find(
                    (time) => time.title === updates.title
                  );

                  if (existingTime) {

                    // if(remove){ } 
                    const final = this.deliveryTimeRepository.create({ ...existingTime, ...updates })
                    const updatedTime = await this.deliveryTimeRepository.save(final);

                    updateDeliveryTime.push(updatedTime);

                  } else {
                    const newTime = this.deliveryTimeRepository.create({ ...updates });
                    const savedTime = await this.deliveryTimeRepository.save(newTime);

                    updateDeliveryTime.push(savedTime);

                  }
                }
                findOption.deliveryTime = updateDeliveryTime
              } catch (error) {
                console.error("Error saving DeliveryTime:", error);
              }
            }

            //update logo
            if (updateSettingDto.options.logo) {

              try {
                const updateLogo = await this.logoSettingsRepository.findOne({
                  where: { id: findOption.logo.id }
                })

                //  if(updateLogo){
                //   const findAttachment = await this.attachmentRepository.findOne({
                //     where: { original: updateLogo.original }
                //   })
                //   console.log("Attachmentssssssssss", findAttachment)

                //   const del1 = await this.attachmentRepository.delete(findAttachment)
                //     console.log("del1", del1)


                //    const del2 = await this.logoSettingsRepository.delete(updateLogo)
                //       console.log("del2", del2)

                //    const updates = this.logoSettingsRepository.create(updateSettingDto.options.logo)
                //    const savedLogo = await this.logoSettingsRepository.save(updates)
                //    console.log("saveedLogoooo**************", savedLogo)
                // } else {
                //   const updates = this.logoSettingsRepository.create(updateSettingDto.options.logo)
                //   const createLogo = await this.logoSettingsRepository.save(updates)
                //   console.log("createLogoooo**************", createLogo)
                // }


              } catch (error) {
                console.error("Error saving logo:", error);
              }
            }

            //update payment gate way
            if (updateSettingDto.options.paymentGateway) {
              try {
                const updatePaymentGateway: PaymentGateway[] = []

                for (const updates of updateSettingDto.options.paymentGateway) {
                  const existingPayment = findOption.paymentGateway.find(
                    (time) => time.title === updates.title
                  );

                  if (existingPayment) {

                    const final = this.paymentGatewayRepository.create({ ...existingPayment, ...updates })
                    const updatedTime = await this.paymentGatewayRepository.save(final);

                    updatePaymentGateway.push(updatedTime);

                  } else {
                    const newTime = this.paymentGatewayRepository.create({ ...updates });
                    const savedTime = await this.paymentGatewayRepository.save(newTime);

                    updatePaymentGateway.push(savedTime);

                  }
                }
                findOption.paymentGateway = updatePaymentGateway
              } catch (error) {
                console.error("Error saving PaymentGateway:", error);
              }

            }

            await this.settingsOptionsRepository.save(findOption)

          }
          const updateSetting = await this.settingRepository.save(setting)
          return updateSetting
        }
      } else {
        throw new NotFoundException(`Setting with ID ${id} not found`);
      }
    } catch (error) {
      throw new NotFoundException(error)
    }
  }

  //remove delivery time and socials
  async remove(id: number) {

    try {

      const findId = await this.deliveryTimeRepository.findOne({
        where: { id: id }
      })

      if (findId) {
        const del1 = await this.deliveryTimeRepository.delete(findId)

      }
      else {
        const find2Id = await this.shopSocialRepository.findOne({
          where: { id: id }
        })
        if (find2Id) {
          const del2 = await this.shopSocialRepository.delete(find2Id)

        } else {
          console.error('Related data is not exist!')
        }

      }
      return `Deleted successfully!`
    } catch (error) {
      throw new NotFoundException(error)
    }
  }
}
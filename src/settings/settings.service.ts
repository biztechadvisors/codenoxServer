/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateSettingDto } from './dto/create-setting.dto'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { ContactDetails, CurrencyOptions, DeliveryTime, EmailAdmin, EmailCustomer, EmailEvent, EmailVendor, Location, LogoSettings, PaymentGateway, SeoSettings, ServerInfo, Setting, SettingsOptions, ShopSocials, SmsAdmin, SmsCustomer, SmsEvent, SmsVendor } from './entities/setting.entity'
import settingsJson from '@db/settings.json'
import { InjectRepository } from '@nestjs/typeorm'
import { ContactDetailsRepository, CurrencyOptionsRepository, DeliveryTimeRepository, EmailAdminRepository, EmailCustomerRepository, EmailEventRepository, EmailVendorRepository, LogoSettingsRepository, PaymentGateWayRepository, SeoSettingsRepository, ServerInfoRepository, SettingRepository, SettingsOptionsRepository, SmsAdminRepository, SmsCustomerRepository, SmsEventRepository, SmsVendorRepository } from './settings.repository'
import { LocationRepository, ShopSocialRepository } from 'src/shops/shops.repository'




const settings = plainToClass(Setting, settingsJson)

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
    @InjectRepository(ShopSocialRepository)
    private shopSocialRepository: ShopSocialRepository,
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
  ){}
  private settings: Setting = settings

 async create(createSettingDto: CreateSettingDto): Promise<Setting> {

   let value4: any
   let value5: any
   let value6: any
   let value7: any
   let value8: any
   let value9: any
   let value10: any
   let value11: any
   let value12: any
   let value13: any
   let value14: any
   let value15: any
   let value16: any
   let value17: any
   let value18: any

   const newSettings = new Setting()
   const newOptions = new SettingsOptions()

    try{
      newSettings.created_at = new Date()
      newSettings.language = createSettingDto.language
     //  newSettings.translated_languages = createSettingDto.translated_languages
      newSettings.updated_at = new Date()
   
      // const setting = await this.settingRepository.save(newSettings)

      //options
      if(createSettingDto.options){
        
        newOptions.currency = createSettingDto.options.currency
        newOptions.currencyToWalletRatio = createSettingDto.options.currencyToWalletRatio
        newOptions.freeShipping = createSettingDto.options.freeShipping
        newOptions.freeShippingAmount = createSettingDto.options.freeShippingAmount ? createSettingDto.options.freeShippingAmount : null
        newOptions.guestCheckout = createSettingDto.options.guestCheckout
        newOptions.defaultAi = createSettingDto.options.defaultAi
        newOptions.defaultPaymentGateway = createSettingDto.options.defaultPaymentGateway
        newOptions.isProductReview = createSettingDto.options.isProductReview
        newOptions.maximumQuestionLimit = createSettingDto.options.maximumQuestionLimit
        newOptions.maxShopDistance = createSettingDto.options.maxShopDistance
        newOptions.minimumOrderAmount = createSettingDto.options.minimumOrderAmount
        newOptions.shippingClass = createSettingDto.options.shippingClass
        newOptions.signupPoints = createSettingDto.options.signupPoints
        newOptions.siteSubtitle = createSettingDto.options.siteSubtitle
        newOptions.siteTitle = createSettingDto.options.siteTitle
        newOptions.StripeCardOnly = createSettingDto.options.StripeCardOnly
        newOptions.taxClass = createSettingDto.options.taxClass
        newOptions.useAi = createSettingDto.options.useAi
        newOptions.useCashOnDelivery = createSettingDto.options.useCashOnDelivery
        newOptions.useEnableGateway = createSettingDto.options.useEnableGateway
        newOptions.useGoogleMap = createSettingDto.options.useGoogleMap
        newOptions.useMustVerifyEmail = createSettingDto.options.useMustVerifyEmail
        newOptions.useOtp = createSettingDto.options.useOtp
        newOptions.created_at = new Date()
        newOptions.updated_at = new Date()

        //contact Detail
        if(createSettingDto.options.contactDetails){
          const newcontact = new ContactDetails()
           console.log("first", createSettingDto.options.contactDetails)
           newcontact.contact = createSettingDto.options.contactDetails.contact
           newcontact.website = createSettingDto.options.contactDetails.website

          // if(createSettingDto.options.contactDetails.location){
          //   const newLocation = new Location()

          //   newLocation.lat = createSettingDto.options.contactDetails.location.lat ? createSettingDto.options.contactDetails.location.lat: null
          //   newLocation.lng = createSettingDto.options.contactDetails.location.lng ? createSettingDto.options.contactDetails.location.lng : null
          //   newLocation.city = createSettingDto.options.contactDetails.location.city ? createSettingDto.options.contactDetails.location.city : null
          //   newLocation.state = createSettingDto.options.contactDetails.location.state ? createSettingDto.options.contactDetails.location.state : null
          //   newLocation.zip = createSettingDto.options.contactDetails.location.zip ? createSettingDto.options.contactDetails.location.zip : null
          //   newLocation.country = createSettingDto.options.contactDetails.location.country ? createSettingDto.options.contactDetails.location.country : null
          //   newLocation.formattedAddress = createSettingDto.options.contactDetails.location.formattedAddress ? createSettingDto.options.contactDetails.location.formattedAddress : null
          //   // const newLocation = createSettingDto.options.contactDetails.location
          //   const locations = await this.locationRepository.save(newLocation)
          //   value6 = locations
            
          // }
          if(createSettingDto.options.contactDetails.socials){
            const socials: ShopSocials[] = [];

            for(const social of createSettingDto.options.contactDetails.socials) {
        
                const newSocial = this.shopSocialRepository.create(social)
                const  socialId = await this.shopSocialRepository.save(newSocial)

               
                socials.push(socialId);
                
                console.log("dekjoo", newcontact.socials)
            }
               newcontact.socials = socials
            console.log("All socials saved with ids: ", socials);
          }
          // newcontact.location = value6
         
          const contacts = await this.contactDetailRepository.save(newcontact)
          const socialIds = contacts.socials.map((social) => social.id);
          console.log("try", contacts, socialIds)
          value5 = contacts.id
          
        }

        //curremcy Option
        if(createSettingDto.options.currencyOptions){
          const newCurrency = new CurrencyOptions()
          
          newCurrency.formation = createSettingDto.options.currencyOptions.formation
          newCurrency.fractions = createSettingDto.options.currencyOptions.fractions
  
          const currencyId = await this.currencyOptionRepository.save(newCurrency)
          value7 = currencyId.id
        }

        //Email Event
        if(createSettingDto.options.emailEvent){
          const newEmail = new EmailEvent()

          if(createSettingDto.options.emailEvent.admin){
            const newAdmin = new EmailAdmin()

            newAdmin.paymentOrder = createSettingDto.options.emailEvent.admin.paymentOrder
            newAdmin.refundOrder = createSettingDto.options.emailEvent.admin.refundOrder
            newAdmin.statusChangeOrder = createSettingDto.options.emailEvent.admin.statusChangeOrder

            const adminId = await this.emailAdminRepository.save(newAdmin)
            value9 = adminId.id
          }

          if(createSettingDto.options.emailEvent.vendor){
            const newVendor = new EmailVendor()

            newVendor.paymentOrder = createSettingDto.options.emailEvent.vendor.paymentOrder
            newVendor.refundOrder = createSettingDto.options.emailEvent.vendor.refundOrder
            newVendor.statusChangeOrder = createSettingDto.options.emailEvent.vendor.statusChangeOrder
            newVendor.createQuestion = createSettingDto.options.emailEvent.vendor.createQuestion
            newVendor.createReview = createSettingDto.options.emailEvent.vendor.createReview

            const vendorId = await this.emailVendorRepository.save(newVendor)
            value10 = vendorId.id
          }

          if(createSettingDto.options.emailEvent.customer){
            const newCustomer = new EmailCustomer()

            newCustomer.paymentOrder = createSettingDto.options.emailEvent.customer.paymentOrder
            newCustomer.refundOrder = createSettingDto.options.emailEvent.customer.refundOrder
            newCustomer.statusChangeOrder = createSettingDto.options.emailEvent.customer.statusChangeOrder
            newCustomer.answerQuestion = createSettingDto.options.emailEvent.customer.answerQuestion
            
            const customerId = await this.emailCustomerRepository.save(newCustomer)
            value11 = customerId.id
          }
          newEmail.admin = value9
          newEmail.vendor = value10
          newEmail.customer = value11

          const emailId = await this.emailEventRepository.save(newEmail)
          value8 = emailId.id
        }

         //sms Event
         if(createSettingDto.options.smsEvent){
          const newSms = new SmsEvent()

          if(createSettingDto.options.smsEvent.admin){
            const newSmsAdmin = new SmsAdmin()

            newSmsAdmin.paymentOrder = createSettingDto.options.smsEvent.admin.paymentOrder
            newSmsAdmin.refundOrder = createSettingDto.options.smsEvent.admin.refundOrder
            newSmsAdmin.statusChangeOrder = createSettingDto.options.smsEvent.admin.statusChangeOrder

            const smsAdminId = await this.smsAdminRepository.save(newSmsAdmin)
            value12 = smsAdminId.id
          }

          if(createSettingDto.options.smsEvent.vendor){
            const newSmsVendor = new SmsVendor()

            newSmsVendor.paymentOrder = createSettingDto.options.smsEvent.vendor.paymentOrder
            newSmsVendor.refundOrder = createSettingDto.options.smsEvent.vendor.refundOrder
            newSmsVendor.statusChangeOrder = createSettingDto.options.smsEvent.vendor.statusChangeOrder


            const smsVendorId = await this.smsVendorRepository.save(newSmsVendor)
            value13 = smsVendorId.id
          }

          if(createSettingDto.options.smsEvent.customer){
            const newSmsCustomer = new SmsCustomer()

            newSmsCustomer.paymentOrder = createSettingDto.options.smsEvent.customer.paymentOrder
            newSmsCustomer.refundOrder = createSettingDto.options.smsEvent.customer.refundOrder
            newSmsCustomer.statusChangeOrder = createSettingDto.options.smsEvent.customer.statusChangeOrder
            
            const smsCustomerId = await this.smsCustomerRepository.save(newSmsCustomer)
            value14 = smsCustomerId.id
          }
          newSms.admin = value12
          newSms.vendor = value13
          newSms.customer = value14

          const smsId = await this.smsEventRepository.save(newSms)
          value15 = smsId.id
        }         

        //seo Setting
        if(createSettingDto.options.seo){
          try{
            const newSeo = new SeoSettings()

          newSeo.ogImage = createSettingDto.options.seo.ogImage ? createSettingDto.options.seo.ogImage : null
          newSeo.ogTitle = createSettingDto.options.seo.ogTitle ? createSettingDto.options.seo.ogTitle : null
          newSeo.ogDescription = createSettingDto.options.seo.ogDescription ? createSettingDto.options.seo.ogDescription : null
          newSeo.metaTitle = createSettingDto.options.seo.metaTitle ? createSettingDto.options.seo.metaTitle : null
          newSeo.metaDescription = createSettingDto.options.seo.metaDescription ? createSettingDto.options.seo.metaDescription : null
          newSeo.metaTags = createSettingDto.options.seo.metaTags ? createSettingDto.options.seo.metaTags : null
          newSeo.twitterCardType = createSettingDto.options.seo.twitterCardType ? createSettingDto.options.seo.twitterCardType : null
          newSeo.twitterHandle = createSettingDto.options.seo.twitterHandle ? createSettingDto.options.seo.twitterHandle : null
          newSeo.canonicalUrl = createSettingDto.options.seo.canonicalUrl ? createSettingDto.options.seo.canonicalUrl : null

          const seoId = await this.seoSettingsRepository.save(newSeo)
          value16 = seoId.id
          } catch(error){
            console.error("Error saving SEO:", error);
          }
        }
          //serverInfo
        // if(createSettingDto.options.server_info){
        //   const newServerInfo = new ServerInfo()

        //   newServerInfo.max_execution_time = createSettingDto.options.server_info.max_execution_time
        //   newServerInfo.max_input_time = createSettingDto.options.server_info.max_input_time
        //   newServerInfo.memory_limit = createSettingDto.options.server_info.memory_limit
        //   newServerInfo.post_max_size = createSettingDto.options.server_info.post_max_size
        //   newServerInfo.upload_max_filesize = createSettingDto.options.server_info.upload_max_filesize

        //   const serverInfoId = await this.serverInfoRepository.save(newServerInfo)

        //   value17 = serverInfoId.id
        // }
        
        //delivery Time
        if(createSettingDto.options.deliveryTime){
          try {
          const newDeliveryTime: DeliveryTime[] = []

         for(const delivery of createSettingDto.options.deliveryTime) {

            const newDelivery = this.deliveryTimeRepository.create(delivery)
            const  deliveryTimeId = await this.deliveryTimeRepository.save(newDelivery)
            newDeliveryTime.push(deliveryTimeId);
            console.log("deliverytime", newDeliveryTime)
        }
          newOptions.deliveryTime = newDeliveryTime
          } catch(error){
              console.error("Error saving DeliveryTime:", error);
          }
        }


        if(createSettingDto.options.logo){
          try{
             const newLogo = new LogoSettings()
             console.log("Logoooooo", createSettingDto.options.logo)
             newLogo.original = createSettingDto.options.logo.original
             newLogo.thumbnail = createSettingDto.options.logo.thumbnail

             const logoId = await this.logoSettingsRepository.save(newLogo)
             value18 = logoId.id
          } catch(error) {
            console.error("Error saving logo:", error);
          }
        } 

        if(createSettingDto.options.paymentGateway){
          try {
            const newPaymentGateway: PaymentGateway[] = []
  
           for(const payment of createSettingDto.options.paymentGateway) {
  
              const newPayment = this.paymentGatewayRepository.create(payment)
              const  paymentGatewayId = await this.paymentGatewayRepository.save(newPayment)
              newPaymentGateway.push(paymentGatewayId);
              console.log("gatewayy", newPaymentGateway)
          }
            newOptions.paymentGateway = newPaymentGateway
            } catch(error){
                console.error("Error saving PaymentGateway:", error);
            }

        }
           //option table insertion
          newOptions.contactDetails = value5
          newOptions.emailEvent = value8
          newOptions.currencyOptions = value7
          newOptions.smsEvent = value15
          newOptions.seo = value16
          newOptions.server_info = value17
          newOptions.logo = value18

         const option = await this.settingsOptionsRepository.save(newOptions)
         const deliveryIds = option.deliveryTime.map((delivery) => delivery.id);
         const paymentGateWayIds = option.paymentGateway.map((gateway) => gateway.id);
         console.log("second", option, deliveryIds, paymentGateWayIds)
         value4 = option
      }

         //setting table insertion
       newSettings.options = value4
       const setting = await this.settingRepository.save(newSettings)
       console.log("first", setting)
   
       return setting
    }catch(error){
      console.error(error)
    }
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

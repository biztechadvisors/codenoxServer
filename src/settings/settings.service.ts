/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateSettingDto } from './dto/create-setting.dto'
import { UpdateSettingDto } from './dto/update-setting.dto'
import { ContactDetails, Setting, SettingsOptions } from './entities/setting.entity'
import settingsJson from '@db/settings.json'
import { InjectRepository } from '@nestjs/typeorm'
import { ContactDetailsRepository, SettingRepository, SettingsOptionsRepository } from './settings.repository'
import { LocationRepository } from 'src/shops/shops.repository'


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
  ){}
  private settings: Setting = settings

 async create(createSettingDto: CreateSettingDto): Promise<Setting> {

   let value4: any
   let value5: any
   let value6: any
   const newSettings = new Setting()
   const newOptions = new SettingsOptions()

    try{
      newSettings.created_at = new Date()
      newSettings.language = createSettingDto.language
     //  newSettings.translated_languages = createSettingDto.translated_languages
      newSettings.updated_at = new Date()
   
      // const setting = await this.settingRepository.save(newSettings)

      if(createSettingDto.options){
        
        newOptions.currency = createSettingDto.options.currency
        newOptions.currencyToWalletRatio = createSettingDto.options.currencyToWalletRatio
        newOptions.freeShipping = createSettingDto.options.freeShipping
        newOptions.freeShippingAmount = createSettingDto.options.freeShippingAmount
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


        if(createSettingDto.options.contactDetails){
          const newcontact = new ContactDetails()
           console.log("first", createSettingDto.options.contactDetails)
           newcontact.contact = createSettingDto.options.contactDetails.contact
           newcontact.website = createSettingDto.options.contactDetails.website

          if(createSettingDto.options.contactDetails.location){

            const newLocation = createSettingDto.options.contactDetails.location
            const locations = await this.locationRepository.save(newLocation)
            value6 = locations
            
          }
          newcontact.location = value6
          const contacts = await this.contactDetailRepository.save(newcontact)
          console.log("try", contacts)
          value5 = contacts.id
          

        }

         newOptions.contactDetails = value5
         const option = await this.settingsOptionsRepository.save(newOptions)
        
         value4 = option

      }

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

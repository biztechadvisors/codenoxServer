/* eslint-disable prettier/prettier */
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
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
import { Shop } from 'src/shops/entities/shop.entity'
import { EntityNotFoundError, Repository } from 'typeorm'



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
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) { }

  async create(shopId: number, createSettingDto: CreateSettingDto): Promise<Setting | { message: string }> {
    try {
      if (!shopId) {
        throw new BadRequestException('shopId is compulsory');
      }

      const shop = await this.shopRepository.findOne({ where: { id: shopId } });
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      const existingSettings = await this.settingRepository.findOne({ where: { shop: { id: shopId }, language: createSettingDto.language } });
      if (existingSettings) {
        return { message: 'Settings for this shop and language already exist' };
      }

      const newSettings = new Setting();
      newSettings.created_at = new Date();
      newSettings.language = createSettingDto.language;
      newSettings.translated_languages = createSettingDto.translated_languages;
      newSettings.updated_at = new Date();
      newSettings.shop = shop;

      const newOptions = await this.createSettingsOptions(createSettingDto.options);

      newSettings.options = newOptions;

      const savedSetting = await this.settingRepository.save(newSettings);
      return savedSetting;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while creating settings');
    }
  }

  async createSettingsOptions(optionsData: Partial<SettingsOptions>): Promise<SettingsOptions> {
    try {
      const newOptions = new SettingsOptions();

      newOptions.contactDetails = optionsData.contactDetails ? await this.saveContactDetails(optionsData.contactDetails) : null;
      newOptions.currency = optionsData.currency;
      newOptions.currencyOptions = optionsData.currencyOptions ? await this.saveCurrencyOptions(optionsData.currencyOptions) : null;
      newOptions.currencyToWalletRatio = optionsData.currencyToWalletRatio;
      newOptions.defaultAi = optionsData.defaultAi;
      newOptions.defaultPaymentGateway = optionsData.defaultPaymentGateway;
      newOptions.deliveryTime = optionsData.deliveryTime;
      newOptions.emailEvent = optionsData.emailEvent ? await this.saveEmailEvent(optionsData.emailEvent) : null;
      newOptions.freeShipping = optionsData.freeShipping;
      newOptions.freeShippingAmount = optionsData.freeShippingAmount;
      newOptions.guestCheckout = optionsData.guestCheckout;
      newOptions.isProductReview = optionsData.isProductReview;
      newOptions.logo = optionsData.logo ? await this.saveLogoSettings(optionsData.logo) : null;
      newOptions.maximumQuestionLimit = optionsData.maximumQuestionLimit;
      newOptions.maxShopDistance = optionsData.maxShopDistance;
      newOptions.minimumOrderAmount = optionsData.minimumOrderAmount;
      newOptions.paymentGateway = optionsData.paymentGateway ? await this.savePaymentGateway(optionsData.paymentGateway) : [];
      newOptions.seo = optionsData.seo ? await this.saveSeoSettings(optionsData.seo) : null;
      newOptions.server_info = optionsData.server_info ? await this.saveServerInfo(optionsData.server_info) : null;
      newOptions.shippingClass = optionsData.shippingClass;
      newOptions.signupPoints = optionsData.signupPoints;
      newOptions.siteSubtitle = optionsData.siteSubtitle;
      newOptions.siteTitle = optionsData.siteTitle;
      newOptions.smsEvent = optionsData.smsEvent ? await this.saveSmsEvent(optionsData.smsEvent) : null;
      newOptions.StripeCardOnly = optionsData.StripeCardOnly;
      newOptions.taxClass = optionsData.taxClass;
      newOptions.useAi = optionsData.useAi;
      newOptions.useCashOnDelivery = optionsData.useCashOnDelivery;
      newOptions.useEnableGateway = optionsData.useEnableGateway;
      newOptions.useGoogleMap = optionsData.useGoogleMap;
      newOptions.useMustVerifyEmail = optionsData.useMustVerifyEmail;
      newOptions.useOtp = optionsData.useOtp;

      const savedOptions = await this.settingsOptionsRepository.save(newOptions);

      return savedOptions;
    } catch (error) {
      console.error('Error creating SettingsOptions:', error);
      throw new InternalServerErrorException('Error creating SettingsOptions');
    }
  }

  async savePaymentGateway(paymentGateways: PaymentGateway[]): Promise<PaymentGateway[]> {
    try {
      const savedPaymentGateways: PaymentGateway[] = [];
      for (const gateway of paymentGateways) {
        if (gateway.id) {
          const existingGateway = await this.paymentGatewayRepository.findOne({ where: { id: gateway.id } });
          if (!existingGateway) {
            console.warn(`PaymentGateway with id ${gateway.id} not found`);
            continue;
          }
          Object.assign(existingGateway, gateway);
          const updatedGateway = await this.paymentGatewayRepository.save(existingGateway);
          savedPaymentGateways.push(updatedGateway);
        } else {
          const newGateway = this.paymentGatewayRepository.create(gateway);
          const savedGateway = await this.paymentGatewayRepository.save(newGateway);
          savedPaymentGateways.push(savedGateway);
        }
      }
      return savedPaymentGateways;
    } catch (error) {
      console.error('Error saving PaymentGateway:', error);
      throw new InternalServerErrorException('Error saving PaymentGateway');
    }
  }

  async saveContactDetails(contactDetailsData: Partial<ContactDetails>): Promise<ContactDetails> {
    try {
      if (contactDetailsData.id) {
        const contactDetailsToUpdate = await this.contactDetailRepository.findOne({ where: { id: contactDetailsData.id } });

        console.log('contactDetailsToUpdate 212', contactDetailsToUpdate)
        if (contactDetailsToUpdate) {
          Object.assign(contactDetailsToUpdate, contactDetailsData);
          return await this.contactDetailRepository.save(contactDetailsToUpdate);
        } else {
          console.warn('ContactDetails not found');
          return null;
        }
      } else {
        const newContactDetails = this.contactDetailRepository.create(contactDetailsData);
        return await this.contactDetailRepository.save(newContactDetails);
      }
    } catch (error) {
      console.error('Error saving ContactDetails:', error);
      throw new InternalServerErrorException('Error saving ContactDetails');
    }
  }

  async saveCurrencyOptions(currencyOptions: CurrencyOptions): Promise<CurrencyOptions> {
    try {
      if (currencyOptions.id) {
        const existingCurrencyOptions = await this.currencyOptionRepository.findOne({ where: { id: currencyOptions.id } });
        if (existingCurrencyOptions) {
          Object.assign(existingCurrencyOptions, currencyOptions);
          return await this.currencyOptionRepository.save(existingCurrencyOptions);
        } else {
          console.warn(`CurrencyOptions with id ${currencyOptions.id} not found`);
          return null;
        }
      } else {
        const newCurrencyOptions = this.currencyOptionRepository.create(currencyOptions);
        return await this.currencyOptionRepository.save(newCurrencyOptions);
      }
    } catch (error) {
      console.error('Error saving CurrencyOptions:', error);
      throw new InternalServerErrorException('Error saving CurrencyOptions');
    }
  }

  async saveEmailEvent(emailEventData: Partial<EmailEvent>): Promise<EmailEvent | null> {
    try {
      if (!emailEventData?.id) {
        const newEmailEvent = this.emailEventRepository.create(emailEventData);
        return await this.emailEventRepository.save(newEmailEvent);
      }

      const emailEventToUpdate = await this.emailEventRepository.findOne({ where: { id: emailEventData.id } });
      if (!emailEventToUpdate) {
        console.warn(`EmailEvent with id ${emailEventData.id} not found`);
        return null;
      }

      // Update only the specified fields
      const updatedEmailEvent = this.emailEventRepository.merge(emailEventToUpdate, emailEventData);

      return await this.emailEventRepository.save(updatedEmailEvent);
    } catch (error) {
      console.error('Error saving EmailEvent:', error);
      throw new InternalServerErrorException('Error saving EmailEvent');
    }
  }

  // Implement other save helper methods similarly...

  async saveSmsEvent(smsEventData: Partial<SmsEvent>): Promise<SmsEvent> {
    if (smsEventData.id) {
      const smsEventToUpdate = await this.smsEventRepository.findOne({ where: { id: smsEventData.id } });
      if (smsEventToUpdate) {
        Object.assign(smsEventToUpdate, smsEventData);
        return await this.smsEventRepository.save(smsEventToUpdate);
      } else {
        console.warn('SmsEvent not found');
        return null;
      }
    } else {
      const newSmsEvent = this.smsEventRepository.create(smsEventData);
      return await this.smsEventRepository.save(newSmsEvent);
    }
  }

  async saveSeoSettings(seoSettingsData: Partial<SeoSettings>): Promise<SeoSettings> {
    if (seoSettingsData.id) {
      const seoSettingsToUpdate = await this.seoSettingsRepository.findOne({ where: { id: seoSettingsData.id } });
      if (seoSettingsToUpdate) {
        Object.assign(seoSettingsToUpdate, seoSettingsData);
        return await this.seoSettingsRepository.save(seoSettingsToUpdate);
      } else {
        console.warn('SeoSettings not found');
        return null;
      }
    } else {
      const newSeoSettings = this.seoSettingsRepository.create(seoSettingsData);
      return await this.seoSettingsRepository.save(newSeoSettings);
    }
  }

  async saveServerInfo(serverInfo: ServerInfo): Promise<ServerInfo> {
    try {
      if (serverInfo.id) {
        const existingServerInfo = await this.serverInfoRepository.findOne({ where: { id: serverInfo.id } });
        if (existingServerInfo) {
          Object.assign(existingServerInfo, serverInfo);
          return await this.serverInfoRepository.save(existingServerInfo);
        } else {
          console.warn(`ServerInfo with id ${serverInfo.id} not found`);
          return null;
        }
      } else {
        const newServerInfo = this.serverInfoRepository.create(serverInfo);
        return await this.serverInfoRepository.save(newServerInfo);
      }
    } catch (error) {
      console.error('Error saving ServerInfo:', error);
      throw new InternalServerErrorException('Error saving ServerInfo');
    }
  }

  async saveLogoSettings(logoSettings: LogoSettings): Promise<LogoSettings | null> {
    try {
      if (!logoSettings?.id) {
        console.warn('Cannot update LogoSettings without ID');
        return null; // Return null when ID is not provided
      }

      const existingLogoSettings = await this.logoSettingsRepository.findOne({ where: { id: logoSettings.id } });
      if (!existingLogoSettings) {
        console.warn(`LogoSettings with id ${logoSettings.id} not found`);
        return null; // Return null when LogoSettings with the provided ID is not found
      }

      Object.assign(existingLogoSettings, logoSettings);
      return await this.logoSettingsRepository.save(existingLogoSettings);
    } catch (error) {
      console.error('Error saving LogoSettings:', error);
      throw new InternalServerErrorException('Error saving LogoSettings');
    }
  }


  async findAll(): Promise<Setting[] | null> {
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
      return settingData;
    }
  }

  async findOne(id: number, shopId: number): Promise<Setting | null> {
    const settingData = await this.settingRepository.findOne({
      where: { id: id, shop: { id: shopId } },
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
      throw new NotFoundException('Setting not found');
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
            // Update contact details
            if (updateSettingDto.options.contactDetails) {
              try {
                const updateContact = await this.contactDetailRepository.findOne({
                  where: { id: findOption.contactDetails.id },
                  relations: ['location', 'socials']
                });

                if (updateContact) {
                  // Update contact information
                  updateContact.contact = updateSettingDto.options.contactDetails.contact;
                  updateContact.website = updateSettingDto.options.contactDetails.website;

                  // Update contact location
                  if (updateSettingDto.options.contactDetails.location) {
                    const updateLocation = await this.locationRepository.findOne({
                      where: { id: updateContact.location.id }
                    });

                    if (updateLocation) {
                      Object.assign(updateLocation, updateSettingDto.options.contactDetails.location);
                      await this.locationRepository.save(updateLocation);
                    } else {
                      throw new NotFoundException("Location not found");
                    }
                  }

                  // Update contact socials
                  if (updateSettingDto.options.contactDetails.socials) {
                    const socials: ShopSocials[] = [];

                    for (const updateSocial of updateSettingDto.options.contactDetails.socials) {
                      const existingSocial = updateContact.socials.find((social) => social.icon === updateSocial.icon);

                      if (existingSocial) {
                        Object.assign(existingSocial, updateSocial);
                        const updatedSocial = await this.shopSocialRepository.save(existingSocial);
                        socials.push(updatedSocial);
                      } else {
                        const newSocial = this.shopSocialRepository.create({ ...updateSocial });
                        const savedSocial = await this.shopSocialRepository.save(newSocial);
                        socials.push(savedSocial);
                      }
                    }
                    updateContact.socials = socials;
                  }

                  await this.contactDetailRepository.save(updateContact);
                } else {
                  throw new NotFoundException("Contact details not found");
                }
              } catch (error) {
                console.error("Error updating contact details:", error);
                throw new NotFoundException("Failed to update contact details");
              }
            }

            // Update currency options
            if (updateSettingDto.options.currencyOptions) {
              try {
                const updateCurrency = await this.currencyOptionRepository.findOne({
                  where: { id: findOption.currencyOptions.id }
                });

                if (updateCurrency) {
                  Object.assign(updateCurrency, updateSettingDto.options.currencyOptions);
                  await this.currencyOptionRepository.save(updateCurrency);
                } else {
                  throw new NotFoundException("Currency options not found");
                }
              } catch (error) {
                console.error("Error updating currency options:", error);
                throw new NotFoundException("Failed to update currency options");
              }
            }


            // Update email event
            if (updateSettingDto.options.emailEvent) {
              try {
                const updateEvent = await this.emailEventRepository.findOne({
                  where: { id: findOption.emailEvent.id },
                  relations: ['admin', 'vendor', 'customer']
                });

                if (updateEvent) {
                  // Update email event admin
                  if (updateSettingDto.options.emailEvent.admin) {
                    const updateAdmin = await this.emailAdminRepository.findOne({
                      where: { id: updateEvent.admin.id }
                    });

                    if (updateAdmin) {
                      Object.assign(updateAdmin, updateSettingDto.options.emailEvent.admin);
                      await this.emailAdminRepository.save(updateAdmin);
                    }
                  }

                  // Update email event vendor
                  if (updateSettingDto.options.emailEvent.vendor) {
                    const updateVendor = await this.emailVendorRepository.findOne({
                      where: { id: updateEvent.vendor.id }
                    });

                    if (updateVendor) {
                      Object.assign(updateVendor, updateSettingDto.options.emailEvent.vendor);
                      await this.emailVendorRepository.save(updateVendor);
                    }
                  }

                  // Update email event customer
                  if (updateSettingDto.options.emailEvent.customer) {
                    const updateCustomer = await this.emailCustomerRepository.findOne({
                      where: { id: updateEvent.customer.id }
                    });

                    if (updateCustomer) {
                      Object.assign(updateCustomer, updateSettingDto.options.emailEvent.customer);
                      await this.emailCustomerRepository.save(updateCustomer);
                    }
                  }
                }
              } catch (error) {
                console.error("Error updating email event:", error);
                throw new NotFoundException("Failed to update email event");
              }
            }

            // Update SMS event
            if (updateSettingDto.options.smsEvent) {
              try {
                const updateSms = await this.smsEventRepository.findOne({
                  where: { id: findOption.smsEvent.id },
                  relations: ['admin', 'vendor', 'customer']
                });

                if (updateSms) {
                  // Update SMS event admin
                  if (updateSettingDto.options.smsEvent.admin) {
                    const updateAdmin = await this.smsAdminRepository.findOne({
                      where: { id: updateSms.admin.id }
                    });

                    if (updateAdmin) {
                      Object.assign(updateAdmin, updateSettingDto.options.smsEvent.admin);
                      await this.smsAdminRepository.save(updateAdmin);
                    }
                  }

                  // Update SMS event vendor
                  if (updateSettingDto.options.smsEvent.vendor) {
                    const updateVendor = await this.smsVendorRepository.findOne({
                      where: { id: updateSms.vendor.id }
                    });

                    if (updateVendor) {
                      Object.assign(updateVendor, updateSettingDto.options.smsEvent.vendor);
                      await this.smsVendorRepository.save(updateVendor);
                    }
                  }

                  // Update SMS event customer
                  if (updateSettingDto.options.smsEvent.customer) {
                    const updateCustomer = await this.smsCustomerRepository.findOne({
                      where: { id: updateSms.customer.id }
                    });

                    if (updateCustomer) {
                      Object.assign(updateCustomer, updateSettingDto.options.smsEvent.customer);
                      await this.smsCustomerRepository.save(updateCustomer);
                    }
                  }
                }
              } catch (error) {
                console.error("Error updating SMS event:", error);
                throw new NotFoundException("Failed to update SMS event");
              }
            }


            //update seo
            if (updateSettingDto?.options?.seo) {
              try {
                let updateSeo = await this.seoSettingsRepository.findOne({
                  where: { id: findOption.seo.id },
                  relations: ['ogImage']
                });

                if (!updateSeo) {
                  throw new NotFoundException(`SEO settings not found`);
                }

                const seoUpdates = updateSettingDto.options.seo;

                updateSeo = {
                  ...updateSeo,
                  ogTitle: seoUpdates.ogTitle || null,
                  ogDescription: seoUpdates.ogDescription || null,
                  metaTitle: seoUpdates.metaTitle || null,
                  metaDescription: seoUpdates.metaDescription || null,
                  metaTags: seoUpdates.metaTags || null,
                  twitterCardType: seoUpdates.twitterCardType || null,
                  twitterHandle: seoUpdates.twitterHandle || null,
                  canonicalUrl: seoUpdates.canonicalUrl || null
                };

                if (seoUpdates.ogImage) {
                  if (updateSeo.ogImage) {
                    const imgId = updateSeo.ogImage.id;
                    updateSeo.ogImage = null;
                    await this.seoSettingsRepository.save(updateSeo);
                    await this.attachmentRepository.delete(imgId);
                  }
                  updateSeo.ogImage = seoUpdates.ogImage;
                }

                await this.seoSettingsRepository.save(updateSeo);
              } catch (error) {
                console.error("Error saving SEO:", error);
                throw new NotFoundException("Failed to update SEO settings");
              }
            }

            if (updateSettingDto.options.server_info) {
              try {
                let updateServerInfo = await this.serverInfoRepository.findOne({
                  where: { id: findOption.server_info.id }
                });

                if (!updateServerInfo) {
                  updateServerInfo = this.serverInfoRepository.create(updateSettingDto.options.server_info);
                } else {
                  updateServerInfo = {
                    ...updateServerInfo,
                    ...updateSettingDto.options.server_info
                  };
                }

                await this.serverInfoRepository.save(updateServerInfo);
              } catch (error) {
                console.error("Error saving server info:", error);
                throw new NotFoundException("Failed to update server info");
              }
            }

            if (updateSettingDto.options.deliveryTime) {
              try {
                const updateDeliveryTime = [];

                for (const updates of updateSettingDto.options.deliveryTime) {
                  let existingTime = findOption.deliveryTime.find(time => time.title === updates.title);

                  if (!existingTime) {
                    existingTime = this.deliveryTimeRepository.create(updates);
                  } else {
                    existingTime = {
                      ...existingTime,
                      ...updates
                    };
                  }

                  const updatedTime = await this.deliveryTimeRepository.save(existingTime);
                  updateDeliveryTime.push(updatedTime);
                }

                findOption.deliveryTime = updateDeliveryTime;
              } catch (error) {
                console.error("Error saving DeliveryTime:", error);
                throw new NotFoundException("Failed to update delivery time");
              }
            }

            if (updateSettingDto?.options?.logo) {
              try {
                let updateLogo = await this.logoSettingsRepository.findOne({
                  where: { id: findOption.logo.id }
                });

                if (!updateLogo) {
                  updateLogo = this.logoSettingsRepository.create(updateSettingDto.options.logo);
                } else {
                  const findAttachment = await this.attachmentRepository.findOne({
                    where: { original: updateLogo.original }
                  });
                  if (findAttachment) {
                    await this.attachmentRepository.delete(findAttachment);
                  }
                  await this.logoSettingsRepository.delete(updateLogo);
                }

                const savedLogo = await this.logoSettingsRepository.save(updateLogo);
                console.log("Saved Logo:", savedLogo);
              } catch (error) {
                console.error("Error saving logo:", error);
                throw new NotFoundException("Failed to update logo");
              }
            }

            if (updateSettingDto?.options?.paymentGateway) {
              try {
                const updatePaymentGateway = [];

                for (const updates of updateSettingDto.options.paymentGateway) {
                  let existingPayment = findOption.paymentGateway.find(time => time.title === updates.title);

                  if (!existingPayment) {
                    existingPayment = this.paymentGatewayRepository.create(updates);
                  } else {
                    existingPayment = {
                      ...existingPayment,
                      ...updates
                    };
                  }

                  const updatedTime = await this.paymentGatewayRepository.save(existingPayment);
                  updatePaymentGateway.push(updatedTime);
                }

                findOption.paymentGateway = updatePaymentGateway;
              } catch (error) {
                console.error("Error saving PaymentGateway:", error);
                throw new NotFoundException("Failed to update payment gateway");
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

  async remove(id: number) {
    try {
      // Find the setting with the specified ID along with its options and shop
      const setting = await this.settingRepository.findOneOrFail({
        where: { id },
        relations: ['options', 'shop'],
      });

      // If setting doesn't exist, throw NotFoundException
      if (!setting) {
        throw new NotFoundException(`Setting with ID ${id} not found`);
      }

      // If setting has a shop associated, remove it
      if (setting.shop) {
        await this.shopRepository.remove(setting.shop);
      }

      // If setting has options associated, remove them
      if (setting.options) {
        await this.settingsOptionsRepository.remove(setting.options);
      }

      // Delete the setting itself
      await this.settingRepository.remove(setting);

      return `Deleted setting with ID ${id} successfully!`;
    } catch (error) {
      // If the error is EntityNotFoundError, return a custom error message
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`Setting with ID ${id} not found`);
      } else {
        // Otherwise, handle other errors and throw an InternalServerErrorException
        console.error('Error deleting setting:', error);
        throw new InternalServerErrorException('Failed to delete setting');
      }
    }
  }

}
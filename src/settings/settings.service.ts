/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
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
import { Repository } from 'typeorm'



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

  async create(shopId: number, createSettingDto: CreateSettingDto): Promise<Setting> {
    try {
      if (!shopId) {
        throw new BadRequestException('shopId is compulsory');
      }

      const shop = await this.shopRepository.findOne({ where: { id: shopId } });
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      const newSettings = new Setting();
      newSettings.created_at = new Date();
      newSettings.language = createSettingDto.language;
      newSettings.translated_languages = createSettingDto.translated_languages;
      newSettings.updated_at = new Date();
      newSettings.shop = shop;

      const newOptions = new SettingsOptions();

      const [
        location,
        currencyId,
        emailId,
        smsId,
        seoId,
        serverInfoId,
        logoId,
        paymentGateway
      ] = await Promise.all([
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
      newOptions.paymentGateway = paymentGateway;

      const savedOptions = await this.settingsOptionsRepository.save(newOptions);
      newSettings.options = savedOptions;

      const savedSetting = await this.settingRepository.save(newSettings);
      return savedSetting;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while creating settings');
    }
  }

  async savePaymentGateway(paymentGateway: PaymentGateway[]): Promise<PaymentGateway[]> {
    try {
      return await this.paymentGatewayRepository.save(paymentGateway);
    } catch (error) {
      console.error('Error saving PaymentGateway:', error);
      throw new InternalServerErrorException('Error saving PaymentGateway');
    }
  }

  async saveContactDetails(contactDetails: ContactDetails): Promise<ContactDetails> {
    try {
      return await this.contactDetailRepository.save(contactDetails);
    } catch (error) {
      console.error('Error saving ContactDetails:', error);
      throw new InternalServerErrorException('Error saving ContactDetails');
    }
  }

  async saveCurrencyOptions(currencyOptions: CurrencyOptions): Promise<CurrencyOptions> {
    try {
      return await this.currencyOptionRepository.save(currencyOptions);
    } catch (error) {
      console.error('Error saving CurrencyOptions:', error);
      throw new InternalServerErrorException('Error saving CurrencyOptions');
    }
  }

  async saveEmailEvent(emailEvent: EmailEvent): Promise<EmailEvent> {
    try {
      return await this.emailEventRepository.save(emailEvent);
    } catch (error) {
      console.error('Error saving EmailEvent:', error);
      throw new InternalServerErrorException('Error saving EmailEvent');
    }
  }

  async saveSmsEvent(smsEvent: SmsEvent): Promise<SmsEvent> {
    try {
      return await this.smsEventRepository.save(smsEvent);
    } catch (error) {
      console.error('Error saving SmsEvent:', error);
      throw new InternalServerErrorException('Error saving SmsEvent');
    }
  }

  async saveSeoSettings(seoSettings: SeoSettings): Promise<SeoSettings> {
    try {
      return await this.seoSettingsRepository.save(seoSettings);
    } catch (error) {
      console.error('Error saving SeoSettings:', error);
      throw new InternalServerErrorException('Error saving SeoSettings');
    }
  }

  async saveServerInfo(serverInfo: ServerInfo): Promise<ServerInfo> {
    try {
      return await this.serverInfoRepository.save(serverInfo);
    } catch (error) {
      console.error('Error saving ServerInfo:', error);
      throw new InternalServerErrorException('Error saving ServerInfo');
    }
  }

  async saveLogoSettings(logoSettings: LogoSettings): Promise<LogoSettings> {
    try {
      return await this.logoSettingsRepository.save(logoSettings);
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
      const setting = await this.settingRepository.findOne({ where: { id: id }, relations: ['options'] });

      if (!setting) {
        throw new NotFoundException(`Setting with ID ${id} not found`);
      }

      if (setting.options) {
        // Delete related entities
        await this.deliveryTimeRepository.remove(setting.options.deliveryTime);
        await this.paymentGatewayRepository.remove(setting.options.paymentGateway);
        // Remove setting's options (will cascade delete related entities)
        await this.settingsOptionsRepository.remove(setting.options);
      }

      // Finally, delete the setting
      await this.settingRepository.remove(setting);

      return `Deleted setting with ID ${id} successfully!`;
    } catch (error) {
      throw new NotFoundException(error.message || 'Error deleting setting');
    }
  }

}
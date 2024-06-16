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
import { EntityNotFoundError, Repository, UpdateValuesMissingError } from 'typeorm'
import { Attachment } from 'src/common/entities/attachment.entity'



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
    @InjectRepository(ServerInfo)
    private ServerInfoRepository: Repository<ServerInfo>,
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

      const existingSettings = await this.settingRepository.findOne({
        where: { shop: { id: shopId }, language: createSettingDto.language },
      });
      if (existingSettings) {
        return { message: 'Settings for this shop and language already exist' };
      }

      const newSettings = new Setting();
      newSettings.language = createSettingDto.language;
      newSettings.translated_languages = createSettingDto.translated_languages;
      newSettings.shop = shop;

      const newOptions = await this.createSettingsOptions(createSettingDto.options);
      newSettings.options = newOptions;

      return await this.settingRepository.save(newSettings);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while creating settings');
    }
  }

  async createSettingsOptions(optionsData: Partial<SettingsOptions>): Promise<SettingsOptions> {
    try {
      const newOptions = new SettingsOptions();

      // Server Info

      const server_info = new ServerInfo;
      server_info.memory_limit = '128M',
        server_info.post_max_size = 8192,
        server_info.max_input_time = '60',
        server_info.max_execution_time = '30',
        server_info.upload_max_filesize = 2048

      newOptions.server_info = await this.ServerInfoRepository.save(server_info);

      // Handle deliveryTime
      if (optionsData.deliveryTime) {
        const savedDeliveryTimes = await Promise.all(optionsData.deliveryTime.map(async time => {
          const deliveryTime = new DeliveryTime();
          deliveryTime.title = time.title;
          deliveryTime.description = time.description;
          return this.deliveryTimeRepository.save(deliveryTime);
        }));

        newOptions.deliveryTime = savedDeliveryTimes;
      }

      newOptions.maxShopDistance = optionsData.maxShopDistance;
      newOptions.minimumOrderAmount = optionsData.minimumOrderAmount;
      newOptions.maximumQuestionLimit = optionsData.maximumQuestionLimit;
      newOptions.currency = optionsData.currency;
      newOptions.siteTitle = optionsData.siteTitle;
      newOptions.siteSubtitle = optionsData.siteSubtitle;
      newOptions.currencyToWalletRatio = optionsData.currencyToWalletRatio;
      newOptions.signupPoints = optionsData.signupPoints;
      newOptions.freeShippingAmount = optionsData.freeShippingAmount;
      newOptions.useEnableGateway = optionsData.useEnableGateway;
      newOptions.useOtp = optionsData.useOtp;
      newOptions.useMustVerifyEmail = optionsData.useMustVerifyEmail;
      newOptions.defaultAi = optionsData.defaultAi;
      newOptions.guestCheckout = optionsData.guestCheckout;
      newOptions.useCashOnDelivery = optionsData.useCashOnDelivery;

      // Set currency options
      if (optionsData.currencyOptions) {
        const currencyOptions = new CurrencyOptions();
        currencyOptions.formation = optionsData.currencyOptions.formation;
        currencyOptions.fractions = optionsData.currencyOptions.fractions;
        newOptions.currencyOptions = await this.currencyOptionRepository.save(currencyOptions);
      }

      // Set SEO settings
      if (optionsData.seo) {
        const seoSettings = new SeoSettings();
        seoSettings.metaTitle = optionsData.seo.metaTitle;
        seoSettings.metaDescription = optionsData.seo.metaDescription;
        seoSettings.ogTitle = optionsData.seo.ogTitle;
        seoSettings.ogDescription = optionsData.seo.ogDescription;
        seoSettings.twitterHandle = optionsData.seo.twitterHandle;
        seoSettings.twitterCardType = optionsData.seo.twitterCardType;
        seoSettings.metaTags = optionsData.seo.metaTags;
        seoSettings.canonicalUrl = optionsData.seo.canonicalUrl;
        seoSettings.ogImage = optionsData.seo?.ogImage
          ? await this.attachmentRepository.findOne({ where: { id: optionsData.seo.ogImage.id } })
          : null;
        newOptions.seo = await this.seoSettingsRepository.save(seoSettings);
      }

      // Set contact details
      if (optionsData.contactDetails) {
        const contactDetails = new ContactDetails();
        contactDetails.contact = optionsData.contactDetails.contact;
        contactDetails.website = optionsData.contactDetails.website;

        const location = new Location;
        location.city = optionsData.contactDetails.location?.city
        location.country = optionsData.contactDetails.location?.country
        location.formattedAddress = optionsData.contactDetails.location?.formattedAddress
        location.lat = optionsData.contactDetails.location?.lat
        location.lng = optionsData.contactDetails.location?.lng
        location.state = optionsData.contactDetails.location?.state
        location.zip = optionsData.contactDetails.location?.zip

        contactDetails.location = await this.locationRepository.save(location);

        // Log contactDetails before saving socials
        console.log('contactDetails before saving socials:', JSON.stringify(contactDetails, null, 2));

        if (optionsData.contactDetails.socials) {
          const savedSocials = await Promise.all(optionsData.contactDetails.socials.map(async social => {
            const shopSocial = new ShopSocials();
            shopSocial.icon = social.icon;
            shopSocial.url = social.url;
            const savedSocial = await this.shopSocialRepository.save(shopSocial);
            console.log('Saved social:', JSON.stringify(savedSocial, null, 2));
            return savedSocial;
          }));

          contactDetails.socials = savedSocials;
        } else {
          contactDetails.socials = [];
        }

        // Log contactDetails before final save
        console.log('contactDetails before final save:', JSON.stringify(contactDetails, null, 2));

        // Save contact details
        const savedContactDetails = await this.contactDetailRepository.save(contactDetails);
        console.log('Saved contactDetails:', JSON.stringify(savedContactDetails, null, 2));
        newOptions.contactDetails = savedContactDetails;
      }

      // Set SMS event
      if (optionsData.smsEvent) {
        const smsEvent = new SmsEvent();

        if (optionsData.smsEvent.admin) {
          const admin = new SmsAdmin();
          admin.paymentOrder = optionsData.smsEvent.admin?.paymentOrder ? true : false;
          admin.refundOrder = optionsData.smsEvent.admin?.refundOrder ? true : false;
          admin.statusChangeOrder = optionsData.smsEvent.admin?.statusChangeOrder ? true : false;

          smsEvent.admin = await this.smsAdminRepository.save(admin);
        }

        if (optionsData.smsEvent.vendor) {
          const vendor = new SmsVendor();
          vendor.paymentOrder = optionsData.smsEvent.vendor?.paymentOrder ? true : false;
          vendor.refundOrder = optionsData.smsEvent.vendor?.refundOrder ? true : false;
          vendor.statusChangeOrder = optionsData.smsEvent.vendor?.statusChangeOrder ? true : false;

          smsEvent.vendor = await this.smsVendorRepository.save(vendor);
        }

        if (optionsData.smsEvent.customer) {
          const customer = new SmsCustomer();
          customer.paymentOrder = optionsData.smsEvent.customer?.paymentOrder ? true : false;
          customer.refundOrder = optionsData.smsEvent.customer?.refundOrder ? true : false;
          customer.statusChangeOrder = optionsData.smsEvent.customer?.statusChangeOrder ? true : false;

          smsEvent.customer = await this.smsCustomerRepository.save(customer);
        }

        newOptions.smsEvent = await this.smsEventRepository.save(smsEvent);
      }

      // Set email event
      if (optionsData.emailEvent) {
        const emailEvent = new EmailEvent();
        if (optionsData.emailEvent.admin) {
          const admin = new EmailAdmin();
          admin.paymentOrder = optionsData.emailEvent.admin?.paymentOrder ? true : false;
          admin.refundOrder = optionsData.emailEvent.admin?.refundOrder ? true : false;
          admin.statusChangeOrder = optionsData.emailEvent.admin?.statusChangeOrder ? true : false;

          emailEvent.admin = await this.emailAdminRepository.save(admin);
        }

        if (optionsData.emailEvent.vendor) {
          const vendor = new EmailVendor();
          vendor.paymentOrder = optionsData.emailEvent.vendor?.paymentOrder ? true : false;
          vendor.refundOrder = optionsData.emailEvent.vendor?.refundOrder ? true : false;
          vendor.statusChangeOrder = optionsData.emailEvent.vendor?.statusChangeOrder ? true : false;
          vendor.createReview = optionsData.emailEvent.vendor?.createReview ? true : false;
          vendor.createQuestion = optionsData.emailEvent.vendor?.createQuestion ? true : false;

          emailEvent.vendor = await this.emailVendorRepository.save(vendor);
        }

        if (optionsData.emailEvent.customer) {
          const customer = new EmailCustomer();
          customer.paymentOrder = optionsData.emailEvent.customer?.paymentOrder ? true : false;
          customer.refundOrder = optionsData.emailEvent.customer?.refundOrder ? true : false;
          customer.statusChangeOrder = optionsData.emailEvent.customer?.statusChangeOrder ? true : false;
          customer.answerQuestion = optionsData.emailEvent.customer?.answerQuestion ? true : false;

          emailEvent.customer = await this.emailCustomerRepository.save(customer);
        }

        newOptions.emailEvent = await this.emailEventRepository.save(emailEvent);
      }

      // Set payment gateways
      if (optionsData.paymentGateway) {
        const paymentGatewayPromises = optionsData.paymentGateway.map(gateway => {
          const paymentGateway = new PaymentGateway();
          paymentGateway.name = gateway.name;
          paymentGateway.title = gateway.title;
          return this.paymentGatewayRepository.save(paymentGateway);
        });
        newOptions.paymentGateway = await Promise.all(paymentGatewayPromises);
      }

      // Set logo
      if (optionsData.logo) {
        const logo = new LogoSettings();
        logo.file_name = optionsData.logo.file_name;
        logo.original = optionsData.logo.original;
        logo.thumbnail = optionsData.logo.thumbnail;

        newOptions.logo = await this.logoSettingsRepository.save(logo);
      }

      // Save newOptions
      const savedOptions = await this.settingsOptionsRepository.save(newOptions);

      // Return saved SettingsOptions entity
      return savedOptions;
    } catch (error) {
      if (error instanceof UpdateValuesMissingError) {
        console.error('Error: Update values are missing.', error);
        throw new BadRequestException('Cannot perform update because update values are missing.');
      }
      console.error('Error creating SettingsOptions:', error);
      throw new InternalServerErrorException('Error creating SettingsOptions');
    }
  }


  async findOne(shop_slug: string): Promise<Setting | null> {
    // Fetch the shop details using the shop slug
    const shop = await this.shopRepository.findOne({ where: { slug: shop_slug } });

    // If the shop is not found, return null
    if (!shop) {
      return null;
    }

    // Fetch the settings using the shop ID
    const settingData = await this.settingRepository.findOne({
      where: { shop: { id: shop.id } }, // Use shop.id here
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
        'options.server_info',
      ],
    });

    // Return the settings if found, otherwise return null
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
                // Clear existing delivery times associated with the option
                findOption.deliveryTime = [];

                // Ensure unique titles in the new delivery times
                const uniqueDeliveryTimes = updateSettingDto.options.deliveryTime.reduce((acc, current) => {
                  const x = acc.find(item => item.title === current.title);
                  if (!x) {
                    return acc.concat([current]);
                  } else {
                    return acc;
                  }
                }, [] as { title: string; description: string }[]);

                const updateDeliveryTime: DeliveryTime[] = [];

                // Create or find and save new delivery times
                for (const updates of uniqueDeliveryTimes) {
                  let deliveryTime = await this.deliveryTimeRepository.findOne({ where: { title: updates.title } });

                  if (!deliveryTime) {
                    deliveryTime = this.deliveryTimeRepository.create(updates);
                    deliveryTime = await this.deliveryTimeRepository.save(deliveryTime);
                  }

                  updateDeliveryTime.push(deliveryTime);
                }

                // Update the deliveryTime property in findOption with the newly saved delivery times
                findOption.deliveryTime = updateDeliveryTime;
              } catch (error) {
                console.error("Error saving DeliveryTime:", error);
                throw new NotFoundException("Failed to update delivery time");
              }
            }

            if (updateSettingDto?.options?.logo) {
              try {

                let updateLogo;
                if (findOption.logo?.id) {
                  updateLogo = await this.logoSettingsRepository.findOne({
                    where: { id: findOption.logo.id }
                  });
                }

                if (!updateLogo) {
                  const logo = new LogoSettings();
                  logo.file_name = updateSettingDto.options.logo.file_name;
                  logo.original = updateSettingDto.options.logo.original;
                  logo.thumbnail = updateSettingDto.options.logo.thumbnail;

                  findOption.logo = await this.logoSettingsRepository.save(logo);
                } else {
                  findOption.logo = null
                  await this.settingsOptionsRepository.save(findOption)

                  const logo = new LogoSettings();
                  logo.file_name = updateSettingDto.options.logo.file_name;
                  logo.original = updateSettingDto.options.logo.original;
                  logo.thumbnail = updateSettingDto.options.logo.thumbnail;

                  await this.logoSettingsRepository.delete({ id: updateLogo.id });
                  findOption.logo = await this.logoSettingsRepository.save(logo);
                }

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
      const setting = await this.settingRepository.findOne({
        where: { id },
        relations: ['shop', 'options'],
      });

      if (!setting) {
        throw new InternalServerErrorException('Setting not found');
      }


      // If setting has options associated, remove them
      if (setting.options) {
        const settingsOptions = await this.settingsOptionsRepository.findOne({
          where: { id: setting.options.id },
          relations: [
            'contactDetails',
            'currencyOptions',
            'deliveryTime',
            'emailEvent',
            'logo',
            'paymentGateway',
            'seo',
            'server_info',
            'smsEvent',
          ],
        });

        if (!settingsOptions) {
          throw new InternalServerErrorException('SettingsOptions not found');
        }

        // Delete the SettingsOptions entity
        await this.settingsOptionsRepository.remove(settingsOptions);
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
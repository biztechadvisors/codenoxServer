"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const setting_entity_1 = require("./entities/setting.entity");
const typeorm_1 = require("@nestjs/typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const typeorm_2 = require("typeorm");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let SettingsService = class SettingsService {
    constructor(settingRepository, settingsOptionsRepository, contactDetailRepository, locationRepository, shopSocialRepository, currencyOptionRepository, emailEventRepository, emailAdminRepository, emailVendorRepository, emailCustomerRepository, smsEventRepository, smsAdminRepository, smsVendorRepository, smsCustomerRepository, seoSettingsRepository, serverInfoRepository, deliveryTimeRepository, logoSettingsRepository, paymentGatewayRepository, attachmentRepository, shopRepository, ServerInfoRepository, cacheManager) {
        this.settingRepository = settingRepository;
        this.settingsOptionsRepository = settingsOptionsRepository;
        this.contactDetailRepository = contactDetailRepository;
        this.locationRepository = locationRepository;
        this.shopSocialRepository = shopSocialRepository;
        this.currencyOptionRepository = currencyOptionRepository;
        this.emailEventRepository = emailEventRepository;
        this.emailAdminRepository = emailAdminRepository;
        this.emailVendorRepository = emailVendorRepository;
        this.emailCustomerRepository = emailCustomerRepository;
        this.smsEventRepository = smsEventRepository;
        this.smsAdminRepository = smsAdminRepository;
        this.smsVendorRepository = smsVendorRepository;
        this.smsCustomerRepository = smsCustomerRepository;
        this.seoSettingsRepository = seoSettingsRepository;
        this.serverInfoRepository = serverInfoRepository;
        this.deliveryTimeRepository = deliveryTimeRepository;
        this.logoSettingsRepository = logoSettingsRepository;
        this.paymentGatewayRepository = paymentGatewayRepository;
        this.attachmentRepository = attachmentRepository;
        this.shopRepository = shopRepository;
        this.ServerInfoRepository = ServerInfoRepository;
        this.cacheManager = cacheManager;
    }
    async create(shopId, createSettingDto) {
        try {
            if (!shopId) {
                throw new common_1.BadRequestException('shopId is compulsory');
            }
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new common_1.NotFoundException('Shop not found');
            }
            const existingSettings = await this.settingRepository.findOne({
                where: { shop: { id: shopId }, language: createSettingDto.language },
            });
            if (existingSettings) {
                return { message: 'Settings for this shop and language already exist' };
            }
            const newSettings = new setting_entity_1.Setting();
            newSettings.language = createSettingDto.language;
            newSettings.translated_languages = createSettingDto.translated_languages;
            newSettings.shop = shop;
            const newOptions = await this.createSettingsOptions(createSettingDto.options);
            newSettings.options = newOptions;
            return await this.settingRepository.save(newSettings);
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('An error occurred while creating settings');
        }
    }
    async createSettingsOptions(optionsData) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4;
        try {
            const newOptions = new setting_entity_1.SettingsOptions();
            const server_info = new setting_entity_1.ServerInfo;
            server_info.memory_limit = '128M',
                server_info.post_max_size = 8192,
                server_info.max_input_time = '60',
                server_info.max_execution_time = '30',
                server_info.upload_max_filesize = 2048;
            newOptions.server_info = await this.ServerInfoRepository.save(server_info);
            if (optionsData.deliveryTime) {
                const savedDeliveryTimes = await Promise.all(optionsData.deliveryTime.map(async (time) => {
                    const deliveryTime = new setting_entity_1.DeliveryTime();
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
            if (optionsData.currencyOptions) {
                const currencyOptions = new setting_entity_1.CurrencyOptions();
                currencyOptions.formation = optionsData.currencyOptions.formation;
                currencyOptions.fractions = optionsData.currencyOptions.fractions;
                newOptions.currencyOptions = await this.currencyOptionRepository.save(currencyOptions);
            }
            if (optionsData.seo) {
                const seoSettings = new setting_entity_1.SeoSettings();
                seoSettings.metaTitle = optionsData.seo.metaTitle;
                seoSettings.metaDescription = optionsData.seo.metaDescription;
                seoSettings.ogTitle = optionsData.seo.ogTitle;
                seoSettings.ogDescription = optionsData.seo.ogDescription;
                seoSettings.twitterHandle = optionsData.seo.twitterHandle;
                seoSettings.twitterCardType = optionsData.seo.twitterCardType;
                seoSettings.metaTags = optionsData.seo.metaTags;
                seoSettings.canonicalUrl = optionsData.seo.canonicalUrl;
                seoSettings.ogImage = ((_a = optionsData.seo) === null || _a === void 0 ? void 0 : _a.ogImage)
                    ? await this.attachmentRepository.findOne({ where: { id: optionsData.seo.ogImage.id } })
                    : null;
                newOptions.seo = await this.seoSettingsRepository.save(seoSettings);
            }
            if (optionsData.contactDetails) {
                const contactDetails = new setting_entity_1.ContactDetails();
                contactDetails.contact = optionsData.contactDetails.contact;
                contactDetails.website = optionsData.contactDetails.website;
                const location = new setting_entity_1.Location;
                location.city = (_b = optionsData.contactDetails.location) === null || _b === void 0 ? void 0 : _b.city;
                location.country = (_c = optionsData.contactDetails.location) === null || _c === void 0 ? void 0 : _c.country;
                location.formattedAddress = (_d = optionsData.contactDetails.location) === null || _d === void 0 ? void 0 : _d.formattedAddress;
                location.lat = (_e = optionsData.contactDetails.location) === null || _e === void 0 ? void 0 : _e.lat;
                location.lng = (_f = optionsData.contactDetails.location) === null || _f === void 0 ? void 0 : _f.lng;
                location.state = (_g = optionsData.contactDetails.location) === null || _g === void 0 ? void 0 : _g.state;
                location.zip = (_h = optionsData.contactDetails.location) === null || _h === void 0 ? void 0 : _h.zip;
                contactDetails.location = await this.locationRepository.save(location);
                if (optionsData.contactDetails.socials) {
                    const savedSocials = await Promise.all(optionsData.contactDetails.socials.map(async (social) => {
                        const shopSocial = new setting_entity_1.ShopSocials();
                        shopSocial.icon = social.icon;
                        shopSocial.url = social.url;
                        const savedSocial = await this.shopSocialRepository.save(shopSocial);
                        return savedSocial;
                    }));
                    contactDetails.socials = savedSocials;
                }
                else {
                    contactDetails.socials = [];
                }
                const savedContactDetails = await this.contactDetailRepository.save(contactDetails);
                newOptions.contactDetails = savedContactDetails;
            }
            if (optionsData.smsEvent) {
                const smsEvent = new setting_entity_1.SmsEvent();
                if (optionsData.smsEvent.admin) {
                    const admin = new setting_entity_1.SmsAdmin();
                    admin.paymentOrder = ((_j = optionsData.smsEvent.admin) === null || _j === void 0 ? void 0 : _j.paymentOrder) ? true : false;
                    admin.refundOrder = ((_k = optionsData.smsEvent.admin) === null || _k === void 0 ? void 0 : _k.refundOrder) ? true : false;
                    admin.statusChangeOrder = ((_l = optionsData.smsEvent.admin) === null || _l === void 0 ? void 0 : _l.statusChangeOrder) ? true : false;
                    smsEvent.admin = await this.smsAdminRepository.save(admin);
                }
                if (optionsData.smsEvent.vendor) {
                    const vendor = new setting_entity_1.SmsVendor();
                    vendor.paymentOrder = ((_m = optionsData.smsEvent.vendor) === null || _m === void 0 ? void 0 : _m.paymentOrder) ? true : false;
                    vendor.refundOrder = ((_o = optionsData.smsEvent.vendor) === null || _o === void 0 ? void 0 : _o.refundOrder) ? true : false;
                    vendor.statusChangeOrder = ((_p = optionsData.smsEvent.vendor) === null || _p === void 0 ? void 0 : _p.statusChangeOrder) ? true : false;
                    smsEvent.vendor = await this.smsVendorRepository.save(vendor);
                }
                if (optionsData.smsEvent.customer) {
                    const customer = new setting_entity_1.SmsCustomer();
                    customer.paymentOrder = ((_q = optionsData.smsEvent.customer) === null || _q === void 0 ? void 0 : _q.paymentOrder) ? true : false;
                    customer.refundOrder = ((_r = optionsData.smsEvent.customer) === null || _r === void 0 ? void 0 : _r.refundOrder) ? true : false;
                    customer.statusChangeOrder = ((_s = optionsData.smsEvent.customer) === null || _s === void 0 ? void 0 : _s.statusChangeOrder) ? true : false;
                    smsEvent.customer = await this.smsCustomerRepository.save(customer);
                }
                newOptions.smsEvent = await this.smsEventRepository.save(smsEvent);
            }
            if (optionsData.emailEvent) {
                const emailEvent = new setting_entity_1.EmailEvent();
                if (optionsData.emailEvent.admin) {
                    const admin = new setting_entity_1.EmailAdmin();
                    admin.paymentOrder = ((_t = optionsData.emailEvent.admin) === null || _t === void 0 ? void 0 : _t.paymentOrder) ? true : false;
                    admin.refundOrder = ((_u = optionsData.emailEvent.admin) === null || _u === void 0 ? void 0 : _u.refundOrder) ? true : false;
                    admin.statusChangeOrder = ((_v = optionsData.emailEvent.admin) === null || _v === void 0 ? void 0 : _v.statusChangeOrder) ? true : false;
                    emailEvent.admin = await this.emailAdminRepository.save(admin);
                }
                if (optionsData.emailEvent.vendor) {
                    const vendor = new setting_entity_1.EmailVendor();
                    vendor.paymentOrder = ((_w = optionsData.emailEvent.vendor) === null || _w === void 0 ? void 0 : _w.paymentOrder) ? true : false;
                    vendor.refundOrder = ((_x = optionsData.emailEvent.vendor) === null || _x === void 0 ? void 0 : _x.refundOrder) ? true : false;
                    vendor.statusChangeOrder = ((_y = optionsData.emailEvent.vendor) === null || _y === void 0 ? void 0 : _y.statusChangeOrder) ? true : false;
                    vendor.createReview = ((_z = optionsData.emailEvent.vendor) === null || _z === void 0 ? void 0 : _z.createReview) ? true : false;
                    vendor.createQuestion = ((_0 = optionsData.emailEvent.vendor) === null || _0 === void 0 ? void 0 : _0.createQuestion) ? true : false;
                    emailEvent.vendor = await this.emailVendorRepository.save(vendor);
                }
                if (optionsData.emailEvent.customer) {
                    const customer = new setting_entity_1.EmailCustomer();
                    customer.paymentOrder = ((_1 = optionsData.emailEvent.customer) === null || _1 === void 0 ? void 0 : _1.paymentOrder) ? true : false;
                    customer.refundOrder = ((_2 = optionsData.emailEvent.customer) === null || _2 === void 0 ? void 0 : _2.refundOrder) ? true : false;
                    customer.statusChangeOrder = ((_3 = optionsData.emailEvent.customer) === null || _3 === void 0 ? void 0 : _3.statusChangeOrder) ? true : false;
                    customer.answerQuestion = ((_4 = optionsData.emailEvent.customer) === null || _4 === void 0 ? void 0 : _4.answerQuestion) ? true : false;
                    emailEvent.customer = await this.emailCustomerRepository.save(customer);
                }
                newOptions.emailEvent = await this.emailEventRepository.save(emailEvent);
            }
            if (optionsData.paymentGateway) {
                const paymentGatewayPromises = optionsData.paymentGateway.map(gateway => {
                    const paymentGateway = new setting_entity_1.PaymentGateway();
                    paymentGateway.name = gateway.name;
                    paymentGateway.title = gateway.title;
                    return this.paymentGatewayRepository.save(paymentGateway);
                });
                newOptions.paymentGateway = await Promise.all(paymentGatewayPromises);
            }
            if (optionsData.logo) {
                const logo = new setting_entity_1.LogoSettings();
                logo.file_name = optionsData.logo.file_name;
                logo.original = optionsData.logo.original;
                logo.thumbnail = optionsData.logo.thumbnail;
                newOptions.logo = await this.logoSettingsRepository.save(logo);
            }
            const savedOptions = await this.settingsOptionsRepository.save(newOptions);
            return savedOptions;
        }
        catch (error) {
            if (error instanceof typeorm_2.UpdateValuesMissingError) {
                console.error('Error: Update values are missing.', error);
                throw new common_1.BadRequestException('Cannot perform update because update values are missing.');
            }
            console.error('Error creating SettingsOptions:', error);
            throw new common_1.InternalServerErrorException('Error creating SettingsOptions');
        }
    }
    async findOne(shop_slug) {
        const cacheKey = `settings_shop_${shop_slug}`;
        let mergedData = await this.cacheManager.get(cacheKey);
        if (!mergedData) {
            const shop = await this.shopRepository
                .createQueryBuilder('shop')
                .leftJoinAndSelect('shop.additionalPermissions', 'additionalPermissions')
                .leftJoinAndSelect('additionalPermissions.permissions', 'permissions')
                .leftJoinAndSelect('shop.permission', 'shopPermission')
                .leftJoinAndSelect('shopPermission.permissions', 'shopPermissions')
                .where('shop.slug = :shop_slug', { shop_slug })
                .getOne();
            if (!shop) {
                return null;
            }
            const settingData = await this.settingRepository
                .createQueryBuilder('setting')
                .leftJoinAndSelect('setting.shop', 'shop')
                .leftJoinAndSelect('setting.options', 'options')
                .leftJoinAndSelect('options.contactDetails', 'contactDetails')
                .leftJoinAndSelect('contactDetails.socials', 'socials')
                .leftJoinAndSelect('contactDetails.location', 'location')
                .leftJoinAndSelect('options.currencyOptions', 'currencyOptions')
                .leftJoinAndSelect('options.emailEvent', 'emailEvent')
                .leftJoinAndSelect('emailEvent.admin', 'emailAdmin')
                .leftJoinAndSelect('emailEvent.vendor', 'emailVendor')
                .leftJoinAndSelect('emailEvent.customer', 'emailCustomer')
                .leftJoinAndSelect('options.smsEvent', 'smsEvent')
                .leftJoinAndSelect('smsEvent.admin', 'smsAdmin')
                .leftJoinAndSelect('smsEvent.vendor', 'smsVendor')
                .leftJoinAndSelect('smsEvent.customer', 'smsCustomer')
                .leftJoinAndSelect('options.seo', 'seo')
                .leftJoinAndSelect('seo.ogImage', 'ogImage')
                .leftJoinAndSelect('options.deliveryTime', 'deliveryTime')
                .leftJoinAndSelect('options.paymentGateway', 'paymentGateway')
                .leftJoinAndSelect('options.logo', 'logo')
                .leftJoinAndSelect('options.server_info', 'serverInfo')
                .where('setting.shopId = :shopId', { shopId: shop.id })
                .getOne();
            mergedData = settingData ? Object.assign(Object.assign({}, settingData), { shop }) : shop;
            await this.cacheManager.set(cacheKey, mergedData, 60 * 5);
        }
        return mergedData;
    }
    async update(id, updateSettingDto) {
        var _a, _b, _c, _d;
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
            });
            if (findSetting) {
                for (let index = 0; index < findSetting.length; index++) {
                    const setting = findSetting[index];
                    setting.language = updateSettingDto.language;
                    setting.translated_languages = updateSettingDto.translated_languages;
                    setting.updated_at = new Date();
                    if (updateSettingDto.options) {
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
                        });
                        findOption.currency = updateSettingDto.options.currency;
                        findOption.currencyToWalletRatio = updateSettingDto.options.currencyToWalletRatio;
                        findOption.freeShipping = updateSettingDto.options.freeShipping;
                        findOption.freeShippingAmount = updateSettingDto.options.freeShippingAmount ? updateSettingDto.options.freeShippingAmount : null;
                        findOption.guestCheckout = updateSettingDto.options.guestCheckout;
                        findOption.defaultAi = updateSettingDto.options.defaultAi;
                        findOption.defaultPaymentGateway = updateSettingDto.options.defaultPaymentGateway;
                        findOption.isProductReview = updateSettingDto.options.isProductReview;
                        findOption.maximumQuestionLimit = updateSettingDto.options.maximumQuestionLimit;
                        findOption.maxShopDistance = updateSettingDto.options.maxShopDistance;
                        findOption.minimumOrderAmount = updateSettingDto.options.minimumOrderAmount;
                        findOption.shippingClass = updateSettingDto.options.shippingClass;
                        findOption.signupPoints = updateSettingDto.options.signupPoints;
                        findOption.siteSubtitle = updateSettingDto.options.siteSubtitle;
                        findOption.siteTitle = updateSettingDto.options.siteTitle;
                        findOption.StripeCardOnly = updateSettingDto.options.StripeCardOnly;
                        findOption.taxClass = updateSettingDto.options.taxClass;
                        findOption.useAi = updateSettingDto.options.useAi;
                        findOption.useCashOnDelivery = updateSettingDto.options.useCashOnDelivery;
                        findOption.useEnableGateway = updateSettingDto.options.useEnableGateway;
                        findOption.useGoogleMap = updateSettingDto.options.useGoogleMap;
                        findOption.useMustVerifyEmail = updateSettingDto.options.useMustVerifyEmail;
                        findOption.useOtp = updateSettingDto.options.useOtp;
                        findOption.updated_at = new Date();
                        if (updateSettingDto.options.contactDetails) {
                            try {
                                const updateContact = await this.contactDetailRepository.findOne({
                                    where: { id: findOption.contactDetails.id },
                                    relations: ['location', 'socials']
                                });
                                if (updateContact) {
                                    updateContact.contact = updateSettingDto.options.contactDetails.contact;
                                    updateContact.website = updateSettingDto.options.contactDetails.website;
                                    if (updateSettingDto.options.contactDetails.location) {
                                        const updateLocation = await this.locationRepository.findOne({
                                            where: { id: updateContact.location.id }
                                        });
                                        if (updateLocation) {
                                            Object.assign(updateLocation, updateSettingDto.options.contactDetails.location);
                                            await this.locationRepository.save(updateLocation);
                                        }
                                        else {
                                            throw new common_1.NotFoundException("Location not found");
                                        }
                                    }
                                    if (updateSettingDto.options.contactDetails.socials) {
                                        const socials = [];
                                        for (const updateSocial of updateSettingDto.options.contactDetails.socials) {
                                            const existingSocial = updateContact.socials.find((social) => social.icon === updateSocial.icon);
                                            if (existingSocial) {
                                                Object.assign(existingSocial, updateSocial);
                                                const updatedSocial = await this.shopSocialRepository.save(existingSocial);
                                                socials.push(updatedSocial);
                                            }
                                            else {
                                                const newSocial = this.shopSocialRepository.create(Object.assign({}, updateSocial));
                                                const savedSocial = await this.shopSocialRepository.save(newSocial);
                                                socials.push(savedSocial);
                                            }
                                        }
                                        updateContact.socials = socials;
                                    }
                                    await this.contactDetailRepository.save(updateContact);
                                }
                                else {
                                    throw new common_1.NotFoundException("Contact details not found");
                                }
                            }
                            catch (error) {
                                console.error("Error updating contact details:", error);
                                throw new common_1.NotFoundException("Failed to update contact details");
                            }
                        }
                        if (updateSettingDto.options.currencyOptions) {
                            try {
                                const updateCurrency = await this.currencyOptionRepository.findOne({
                                    where: { id: findOption.currencyOptions.id }
                                });
                                if (updateCurrency) {
                                    Object.assign(updateCurrency, updateSettingDto.options.currencyOptions);
                                    await this.currencyOptionRepository.save(updateCurrency);
                                }
                                else {
                                    throw new common_1.NotFoundException("Currency options not found");
                                }
                            }
                            catch (error) {
                                console.error("Error updating currency options:", error);
                                throw new common_1.NotFoundException("Failed to update currency options");
                            }
                        }
                        if (updateSettingDto.options.emailEvent) {
                            try {
                                const updateEvent = await this.emailEventRepository.findOne({
                                    where: { id: findOption.emailEvent.id },
                                    relations: ['admin', 'vendor', 'customer']
                                });
                                if (updateEvent) {
                                    if (updateSettingDto.options.emailEvent.admin) {
                                        const updateAdmin = await this.emailAdminRepository.findOne({
                                            where: { id: updateEvent.admin.id }
                                        });
                                        if (updateAdmin) {
                                            Object.assign(updateAdmin, updateSettingDto.options.emailEvent.admin);
                                            await this.emailAdminRepository.save(updateAdmin);
                                        }
                                    }
                                    if (updateSettingDto.options.emailEvent.vendor) {
                                        const updateVendor = await this.emailVendorRepository.findOne({
                                            where: { id: updateEvent.vendor.id }
                                        });
                                        if (updateVendor) {
                                            Object.assign(updateVendor, updateSettingDto.options.emailEvent.vendor);
                                            await this.emailVendorRepository.save(updateVendor);
                                        }
                                    }
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
                            }
                            catch (error) {
                                console.error("Error updating email event:", error);
                                throw new common_1.NotFoundException("Failed to update email event");
                            }
                        }
                        if (updateSettingDto.options.smsEvent) {
                            try {
                                const updateSms = await this.smsEventRepository.findOne({
                                    where: { id: findOption.smsEvent.id },
                                    relations: ['admin', 'vendor', 'customer']
                                });
                                if (updateSms) {
                                    if (updateSettingDto.options.smsEvent.admin) {
                                        const updateAdmin = await this.smsAdminRepository.findOne({
                                            where: { id: updateSms.admin.id }
                                        });
                                        if (updateAdmin) {
                                            Object.assign(updateAdmin, updateSettingDto.options.smsEvent.admin);
                                            await this.smsAdminRepository.save(updateAdmin);
                                        }
                                    }
                                    if (updateSettingDto.options.smsEvent.vendor) {
                                        const updateVendor = await this.smsVendorRepository.findOne({
                                            where: { id: updateSms.vendor.id }
                                        });
                                        if (updateVendor) {
                                            Object.assign(updateVendor, updateSettingDto.options.smsEvent.vendor);
                                            await this.smsVendorRepository.save(updateVendor);
                                        }
                                    }
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
                            }
                            catch (error) {
                                console.error("Error updating SMS event:", error);
                                throw new common_1.NotFoundException("Failed to update SMS event");
                            }
                        }
                        if ((_a = updateSettingDto === null || updateSettingDto === void 0 ? void 0 : updateSettingDto.options) === null || _a === void 0 ? void 0 : _a.seo) {
                            try {
                                let updateSeo = await this.seoSettingsRepository.findOne({
                                    where: { id: findOption.seo.id },
                                    relations: ['ogImage']
                                });
                                if (!updateSeo) {
                                    throw new common_1.NotFoundException(`SEO settings not found`);
                                }
                                const seoUpdates = updateSettingDto.options.seo;
                                updateSeo = Object.assign(Object.assign({}, updateSeo), { ogTitle: seoUpdates.ogTitle || null, ogDescription: seoUpdates.ogDescription || null, metaTitle: seoUpdates.metaTitle || null, metaDescription: seoUpdates.metaDescription || null, metaTags: seoUpdates.metaTags || null, twitterCardType: seoUpdates.twitterCardType || null, twitterHandle: seoUpdates.twitterHandle || null, canonicalUrl: seoUpdates.canonicalUrl || null });
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
                            }
                            catch (error) {
                                console.error("Error saving SEO:", error);
                                throw new common_1.NotFoundException("Failed to update SEO settings");
                            }
                        }
                        if (updateSettingDto.options.server_info) {
                            try {
                                let updateServerInfo = await this.serverInfoRepository.findOne({
                                    where: { id: findOption.server_info.id }
                                });
                                if (!updateServerInfo) {
                                    updateServerInfo = this.serverInfoRepository.create(updateSettingDto.options.server_info);
                                }
                                else {
                                    updateServerInfo = Object.assign(Object.assign({}, updateServerInfo), updateSettingDto.options.server_info);
                                }
                                await this.serverInfoRepository.save(updateServerInfo);
                            }
                            catch (error) {
                                console.error("Error saving server info:", error);
                                throw new common_1.NotFoundException("Failed to update server info");
                            }
                        }
                        if (updateSettingDto.options.deliveryTime) {
                            try {
                                findOption.deliveryTime = [];
                                const uniqueDeliveryTimes = updateSettingDto.options.deliveryTime.reduce((acc, current) => {
                                    const x = acc.find(item => item.title === current.title);
                                    if (!x) {
                                        return acc.concat([current]);
                                    }
                                    else {
                                        return acc;
                                    }
                                }, []);
                                const updateDeliveryTime = [];
                                for (const updates of uniqueDeliveryTimes) {
                                    let deliveryTime = await this.deliveryTimeRepository.findOne({ where: { title: updates.title } });
                                    if (!deliveryTime) {
                                        deliveryTime = this.deliveryTimeRepository.create(updates);
                                        deliveryTime = await this.deliveryTimeRepository.save(deliveryTime);
                                    }
                                    updateDeliveryTime.push(deliveryTime);
                                }
                                findOption.deliveryTime = updateDeliveryTime;
                            }
                            catch (error) {
                                console.error("Error saving DeliveryTime:", error);
                                throw new common_1.NotFoundException("Failed to update delivery time");
                            }
                        }
                        if ((_b = updateSettingDto === null || updateSettingDto === void 0 ? void 0 : updateSettingDto.options) === null || _b === void 0 ? void 0 : _b.logo) {
                            try {
                                let updateLogo;
                                if ((_c = findOption.logo) === null || _c === void 0 ? void 0 : _c.id) {
                                    updateLogo = await this.logoSettingsRepository.findOne({
                                        where: { id: findOption.logo.id }
                                    });
                                }
                                if (!updateLogo) {
                                    const logo = new setting_entity_1.LogoSettings();
                                    logo.file_name = updateSettingDto.options.logo.file_name;
                                    logo.original = updateSettingDto.options.logo.original;
                                    logo.thumbnail = updateSettingDto.options.logo.thumbnail;
                                    findOption.logo = await this.logoSettingsRepository.save(logo);
                                }
                                else {
                                    findOption.logo = null;
                                    await this.settingsOptionsRepository.save(findOption);
                                    const logo = new setting_entity_1.LogoSettings();
                                    logo.file_name = updateSettingDto.options.logo.file_name;
                                    logo.original = updateSettingDto.options.logo.original;
                                    logo.thumbnail = updateSettingDto.options.logo.thumbnail;
                                    await this.logoSettingsRepository.delete({ id: updateLogo.id });
                                    findOption.logo = await this.logoSettingsRepository.save(logo);
                                }
                            }
                            catch (error) {
                                console.error("Error saving logo:", error);
                                throw new common_1.NotFoundException("Failed to update logo");
                            }
                        }
                        if ((_d = updateSettingDto === null || updateSettingDto === void 0 ? void 0 : updateSettingDto.options) === null || _d === void 0 ? void 0 : _d.paymentGateway) {
                            try {
                                const updatePaymentGateway = [];
                                for (const updates of updateSettingDto.options.paymentGateway) {
                                    let existingPayment = findOption.paymentGateway.find(time => time.title === updates.title);
                                    if (!existingPayment) {
                                        existingPayment = this.paymentGatewayRepository.create(updates);
                                    }
                                    else {
                                        existingPayment = Object.assign(Object.assign({}, existingPayment), updates);
                                    }
                                    const updatedTime = await this.paymentGatewayRepository.save(existingPayment);
                                    updatePaymentGateway.push(updatedTime);
                                }
                                findOption.paymentGateway = updatePaymentGateway;
                            }
                            catch (error) {
                                console.error("Error saving PaymentGateway:", error);
                                throw new common_1.NotFoundException("Failed to update payment gateway");
                            }
                        }
                        await this.settingsOptionsRepository.save(findOption);
                    }
                    const updateSetting = await this.settingRepository.save(setting);
                    return updateSetting;
                }
            }
            else {
                throw new common_1.NotFoundException(`Setting with ID ${id} not found`);
            }
        }
        catch (error) {
            throw new common_1.NotFoundException(error);
        }
    }
    async remove(id) {
        try {
            const setting = await this.settingRepository.findOne({
                where: { id },
                relations: ['shop', 'options'],
            });
            if (!setting) {
                throw new common_1.InternalServerErrorException('Setting not found');
            }
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
                    throw new common_1.InternalServerErrorException('SettingsOptions not found');
                }
                await this.settingsOptionsRepository.remove(settingsOptions);
            }
            await this.settingRepository.remove(setting);
            return `Deleted setting with ID ${id} successfully!`;
        }
        catch (error) {
            if (error instanceof typeorm_2.EntityNotFoundError) {
                throw new common_1.NotFoundException(`Setting with ID ${id} not found`);
            }
            else {
                console.error('Error deleting setting:', error);
                throw new common_1.InternalServerErrorException('Failed to delete setting');
            }
        }
    }
};
SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __param(1, (0, typeorm_1.InjectRepository)(setting_entity_1.SettingsOptions)),
    __param(2, (0, typeorm_1.InjectRepository)(setting_entity_1.ContactDetails)),
    __param(3, (0, typeorm_1.InjectRepository)(setting_entity_1.Location)),
    __param(4, (0, typeorm_1.InjectRepository)(setting_entity_1.ShopSocials)),
    __param(5, (0, typeorm_1.InjectRepository)(setting_entity_1.CurrencyOptions)),
    __param(6, (0, typeorm_1.InjectRepository)(setting_entity_1.EmailEvent)),
    __param(7, (0, typeorm_1.InjectRepository)(setting_entity_1.EmailAdmin)),
    __param(8, (0, typeorm_1.InjectRepository)(setting_entity_1.EmailVendor)),
    __param(9, (0, typeorm_1.InjectRepository)(setting_entity_1.EmailCustomer)),
    __param(10, (0, typeorm_1.InjectRepository)(setting_entity_1.SmsEvent)),
    __param(11, (0, typeorm_1.InjectRepository)(setting_entity_1.SmsAdmin)),
    __param(12, (0, typeorm_1.InjectRepository)(setting_entity_1.SmsVendor)),
    __param(13, (0, typeorm_1.InjectRepository)(setting_entity_1.SmsCustomer)),
    __param(14, (0, typeorm_1.InjectRepository)(setting_entity_1.SeoSettings)),
    __param(15, (0, typeorm_1.InjectRepository)(setting_entity_1.ServerInfo)),
    __param(16, (0, typeorm_1.InjectRepository)(setting_entity_1.DeliveryTime)),
    __param(17, (0, typeorm_1.InjectRepository)(setting_entity_1.LogoSettings)),
    __param(18, (0, typeorm_1.InjectRepository)(setting_entity_1.PaymentGateway)),
    __param(19, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(20, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(21, (0, typeorm_1.InjectRepository)(setting_entity_1.ServerInfo)),
    __param(22, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], SettingsService);
exports.SettingsService = SettingsService;
//# sourceMappingURL=settings.service.js.map
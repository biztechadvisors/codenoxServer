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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopsService = void 0;
const common_1 = require("@nestjs/common");
const shop_entity_1 = require("./entities/shop.entity");
const fuse_js_1 = __importDefault(require("fuse.js"));
const paginate_1 = require("../common/pagination/paginate");
const typeorm_1 = require("@nestjs/typeorm");
const helpers_1 = require("../helpers");
const balance_entity_1 = require("./entities/balance.entity");
const setting_entity_1 = require("../settings/entities/setting.entity");
const address_entity_1 = require("../address/entities/address.entity");
const user_entity_1 = require("../users/entities/user.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shopSettings_entity_1 = require("./entities/shopSettings.entity");
const addresses_service_1 = require("../address/addresses.service");
const permission_entity_1 = require("../permission/entities/permission.entity");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const analytics_service_1 = require("../analytics/analytics.service");
let ShopsService = class ShopsService {
    constructor(analyticsService, shopRepository, balanceRepository, shopSettingsRepository, paymentInfoRepository, addressRepository, userAddressRepository, shopSocialsRepository, locationRepository, userRepository, attachmentRepository, permissionRepository, addressesService, cacheManager) {
        this.analyticsService = analyticsService;
        this.shopRepository = shopRepository;
        this.balanceRepository = balanceRepository;
        this.shopSettingsRepository = shopSettingsRepository;
        this.paymentInfoRepository = paymentInfoRepository;
        this.addressRepository = addressRepository;
        this.userAddressRepository = userAddressRepository;
        this.shopSocialsRepository = shopSocialsRepository;
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
        this.attachmentRepository = attachmentRepository;
        this.permissionRepository = permissionRepository;
        this.addressesService = addressesService;
        this.cacheManager = cacheManager;
        this.shops = [];
    }
    async convertToSlug(text) {
        return await (0, helpers_1.convertToSlug)(text);
    }
    async create(createShopDto) {
        var _a;
        const newShop = new shop_entity_1.Shop();
        const newBalance = new balance_entity_1.Balance();
        try {
            const userToUpdate = await this.userRepository.findOne({
                where: { id: createShopDto.user.id },
                relations: ['permission'],
            });
            if (!userToUpdate) {
                throw new Error('User does not exist');
            }
            if (userToUpdate.permission.type_name !== user_entity_1.UserType.Company) {
                throw new Error('User is not a vendor');
            }
            let addressId;
            if (createShopDto.address) {
                const addressExists = await this.userAddressRepository.findOne({
                    where: { customer_id: createShopDto.user.id },
                });
                if (!addressExists) {
                    const userAdd = new address_entity_1.UserAdd();
                    userAdd.city = createShopDto.address.city;
                    userAdd.country = createShopDto.address.country;
                    userAdd.customer_id = userToUpdate === null || userToUpdate === void 0 ? void 0 : userToUpdate.id;
                    userAdd.state = createShopDto.address.state;
                    userAdd.street_address = createShopDto.address.street_address;
                    userAdd.zip = (_a = createShopDto.address) === null || _a === void 0 ? void 0 : _a.zip;
                    userAdd.created_at = createShopDto.address.created_at;
                    userAdd.updated_at = createShopDto.address.updated_at;
                    addressId = await this.userAddressRepository.save(userAdd);
                    const address = new address_entity_1.Add();
                    address.address = addressId;
                    address.title = `${createShopDto.address.street_address + " " + createShopDto.address.city + " " + createShopDto.address.state}`;
                    address.customer = userToUpdate;
                    address.default = true;
                    address.type = address_entity_1.AddressType.SHOP;
                    address.created_at = new Date();
                    address.updated_at = new Date();
                    this.addressRepository.save(address);
                }
                addressId = addressExists;
            }
            let settingId;
            if (createShopDto.settings) {
                const newSettings = this.shopSettingsRepository.create(createShopDto.settings);
                if (createShopDto.settings.socials && createShopDto.settings.socials.length > 0) {
                    const socials = [];
                    for (const social of createShopDto.settings.socials) {
                        const newSocial = this.shopSocialsRepository.create(social);
                        const savedSocial = await this.shopSocialsRepository.save(newSocial);
                        socials.push(savedSocial);
                    }
                    newSettings.socials = socials;
                }
                if (createShopDto.settings.location) {
                    const newLocation = this.locationRepository.create(createShopDto.settings.location);
                    const savedLocation = await this.locationRepository.save(newLocation);
                    newSettings.location = savedLocation;
                }
                newSettings.contact = createShopDto.settings.contact;
                newSettings.website = createShopDto.settings.website;
                settingId = await this.shopSettingsRepository.save(newSettings);
                if (settingId.socials) {
                    const socialIds = settingId.socials.map((social) => social);
                    settingId.socials = socialIds;
                }
            }
            newShop.name = createShopDto.name;
            newShop.slug = await this.convertToSlug(createShopDto.name);
            newShop.description = createShopDto.description;
            newShop.owner = userToUpdate;
            newShop.owner_id = createShopDto.user.id;
            if (createShopDto.cover_image && createShopDto.cover_image.length > 0) {
                const attachments = await this.attachmentRepository.findByIds(createShopDto.cover_image);
                newShop.cover_image = attachments;
            }
            newShop.logo = createShopDto.logo ? await this.attachmentRepository.findOne({ where: { id: createShopDto.logo.id } }) : undefined;
            newShop.address = addressId;
            newShop.settings = settingId;
            newShop.created_at = new Date();
            const shop = await this.shopRepository.save(newShop);
            if (createShopDto.balance) {
                let savedPaymentInfo;
                if (createShopDto.balance.payment_info) {
                    const newPaymentInfo = this.paymentInfoRepository.create(createShopDto.balance.payment_info);
                    savedPaymentInfo = await this.paymentInfoRepository.save(newPaymentInfo);
                }
                newBalance.admin_commission_rate = createShopDto.balance.admin_commission_rate;
                newBalance.current_balance = createShopDto.balance.current_balance;
                if (savedPaymentInfo) {
                    newBalance.payment_info = savedPaymentInfo;
                }
                newBalance.total_earnings = createShopDto.balance.total_earnings;
                newBalance.withdrawn_amount = createShopDto.balance.withdrawn_amount;
                newBalance.shop = shop;
                const balance = await this.balanceRepository.save(newBalance);
                shop.balance = balance;
            }
            if (createShopDto.user) {
                userToUpdate.shop_id = shop.id;
                userToUpdate.managed_shop = shop;
                await this.userRepository.save(userToUpdate);
            }
            if (createShopDto.permission) {
                const permission = await this.permissionRepository.findOne({
                    where: { permission_name: (0, typeorm_2.ILike)(createShopDto.permission) },
                });
                if (permission) {
                    newShop.permission = permission;
                    if (permission.type_name === user_entity_1.UserType.Company) {
                    }
                }
            }
            if (createShopDto.additionalPermissions) {
                const additionalPermissions = await this.permissionRepository.find({
                    where: { permission_name: (0, typeorm_2.ILike)(createShopDto.additionalPermissions) },
                });
                if (additionalPermissions) {
                    newShop.additionalPermissions = additionalPermissions;
                }
            }
            await this.shopRepository.save(newShop);
            const createdShop = await this.shopRepository.findOne({
                where: { id: shop.id },
                relations: ['balance'],
            });
            await this.analyticsService.updateAnalytics(undefined, undefined, createdShop);
            return createdShop;
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('An error occurred while creating the shop.');
        }
    }
    async getShops({ search, limit, page }) {
        page = page ? page : 1;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const cacheKey = `shops_${search || 'all'}_${page}_${limit}`;
        let data = await this.cacheManager.get(cacheKey);
        if (!data) {
            data = await this.shopRepository.find({
                relations: [
                    'balance',
                    'balance.shop',
                    'staffs',
                    'owner',
                    'owner.profile',
                    'cover_image',
                    'logo',
                    'address',
                    'settings',
                    'settings.socials',
                    'settings.location',
                    'permission',
                    'additionalPermissions',
                    'additionalPermissions.permissions',
                    'events',
                    'regions',
                ],
            });
            if (search) {
                const fuse = new fuse_js_1.default(data, {
                    keys: ['name', 'id', 'slug', 'is_active', 'address.city', 'address.state', 'address.country'],
                    threshold: 0.7,
                });
                const searchResults = fuse.search(search);
                data = searchResults.map(({ item }) => item);
            }
            await this.cacheManager.set(cacheKey, data, 60);
        }
        const results = search ? data.slice(startIndex, endIndex) : data;
        const mappedResults = results.map((shop) => ({
            created_at: shop.created_at,
            updated_at: shop.updated_at,
            id: shop.id,
            owner_id: shop.owner_id,
            is_active: shop.is_active,
            orders_count: shop.orders_count,
            products_count: shop.products_count,
            name: shop.name,
            slug: shop.slug,
            description: shop.description,
            gst_number: shop.gst_number,
            balance: shop.balance ? {
                id: shop.balance.id,
                admin_commission_rate: shop.balance.admin_commission_rate,
                total_earnings: shop.balance.total_earnings,
                withdrawn_amount: shop.balance.withdrawn_amount,
                current_balance: shop.balance.current_balance,
                shop: shop.balance.shop,
                dealer: null,
                payment_info: shop.balance.payment_info ? {
                    id: shop.balance.payment_info.id,
                    account: shop.balance.payment_info.account,
                    name: shop.balance.payment_info.name,
                    email: shop.balance.payment_info.email,
                    bank: shop.balance.payment_info.bank,
                } : null,
            } : null,
            settings: shop.settings ? {
                id: shop.settings.id,
                contact: shop.settings.contact,
                website: shop.settings.website,
                socials: shop.settings.socials,
                location: shop.settings.location,
            } : null,
            address: shop.address ? {
                id: shop.address.id,
                street_address: shop.address.street_address,
                country: shop.address.country,
                city: shop.address.city,
                state: shop.address.state,
                zip: shop.address.zip,
            } : null,
            owner: shop.owner ? {
                is_active: shop.owner.is_active,
                created_at: shop.owner.created_at,
                updated_at: shop.owner.updated_at,
                id: shop.owner.id,
                name: shop.owner.name,
                email: shop.owner.email,
                password: shop.owner.password,
                otp: shop.owner.otp,
                isVerified: shop.owner.isVerified,
                shop_id: shop.owner.shop_id,
                permission: shop.owner.permission,
                walletPoints: shop.owner.walletPoints,
                contact: shop.owner.contact,
                email_verified_at: shop.owner.email_verified_at,
                profile: shop.owner.profile,
            } : null,
            cover_image: shop.cover_image || [],
            logo: shop.logo ? {
                id: shop.logo.id || "",
                thumbnail: shop.logo.thumbnail || "",
                original: shop.logo.original || "",
            } : null,
            staffs: shop.staffs || [],
            additionalPermissions: shop.additionalPermissions || [],
            permission: shop.permission || null,
        }));
        return Object.assign({ data: mappedResults }, (0, paginate_1.paginate)(data.length, page, limit, results.length, `/shops?search=${search}&limit=${limit}`));
    }
    async getStaffs({ shop_id, limit, page, orderBy, sortedBy, createdBy }) {
        const limitNum = limit || 10;
        const pageNum = page || 1;
        const startIndex = (pageNum - 1) * limitNum;
        const cacheKey = `staffs_${shop_id}_${limit}_${page}_${orderBy}_${sortedBy}_${createdBy}`;
        const cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return cachedResult;
        }
        if (createdBy) {
            const creator = await this.userRepository.findOne({ where: { createdBy: { id: createdBy } } });
            if (!creator) {
                return {
                    data: [],
                    message: 'Invalid createdBy parameter'
                };
            }
        }
        else {
            return {
                data: [],
                message: 'createdBy parameter is required'
            };
        }
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        queryBuilder
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.dealer', 'dealer')
            .leftJoinAndSelect('user.owned_shops', 'owned_shops')
            .leftJoinAndSelect('user.inventoryStocks', 'inventoryStocks')
            .leftJoinAndSelect('user.stocks', 'stocks')
            .leftJoinAndSelect('user.managed_shop', 'managed_shop')
            .leftJoinAndSelect('user.address', 'address')
            .leftJoinAndSelect('user.orders', 'orders')
            .leftJoinAndSelect('user.stocksSellOrd', 'stocksSellOrd')
            .leftJoinAndSelect('user.permission', 'permission');
        queryBuilder.skip(startIndex).take(limitNum);
        if (orderBy && sortedBy) {
            queryBuilder.addOrderBy(`user.${orderBy}`, sortedBy.toUpperCase());
        }
        if (shop_id) {
            queryBuilder.andWhere('user.shop_id = :shop_id', { shop_id });
        }
        const permission = await this.permissionRepository.findOne({ where: { type_name: 'Staff' } });
        if (!permission) {
            throw new common_1.NotFoundException(`Permission for type "Staff" not found.`);
        }
        queryBuilder.andWhere('user.permission = :permission', { permission: permission.id });
        queryBuilder.andWhere('user.createdBy = :createdBy', { createdBy });
        const [users, total] = await queryBuilder.getManyAndCount();
        const url = `/users?type=staff&limit=${limitNum}`;
        const result = Object.assign({ data: users }, (0, paginate_1.paginate)(total, pageNum, limitNum, total, url));
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
    async getShop(slug) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        try {
            const cacheKey = `shop_${slug}`;
            let existShop = await this.cacheManager.get(cacheKey);
            if (!existShop) {
                existShop = await this.shopRepository.findOne({
                    where: { slug: slug },
                    relations: [
                        'balance',
                        'balance.payment_info',
                        'settings',
                        'address',
                        'owner',
                        'owner.profile',
                        'cover_image',
                        'logo',
                        'staffs',
                        'additionalPermissions',
                        'additionalPermissions.permissions',
                        'permission',
                        'permission.permissions',
                        'regions',
                        'events',
                    ],
                });
                if (!existShop) {
                    console.error('Shop Not Found');
                    return null;
                }
                await this.cacheManager.set(cacheKey, existShop, 60);
            }
            const mappedShop = {
                id: existShop.id,
                owner_id: existShop.owner_id,
                name: existShop.name,
                slug: existShop.slug,
                description: existShop.description,
                balance: existShop.balance
                    ? {
                        id: existShop.balance.id,
                        admin_commission_rate: existShop.balance.admin_commission_rate,
                        total_earnings: existShop.balance.total_earnings,
                        withdrawn_amount: existShop.balance.withdrawn_amount,
                        current_balance: existShop.balance.current_balance,
                        shop: (_a = existShop.balance.shop) !== null && _a !== void 0 ? _a : null,
                        dealer: null,
                        payment_info: existShop.balance.payment_info
                            ? {
                                id: existShop.balance.payment_info.id,
                                account: existShop.balance.payment_info.account,
                                name: existShop.balance.payment_info.name,
                                email: existShop.balance.payment_info.email,
                                bank: existShop.balance.payment_info.bank,
                            }
                            : null,
                    }
                    : null,
                cover_image: (_b = existShop.cover_image) !== null && _b !== void 0 ? _b : null,
                logo: existShop.logo
                    ? {
                        id: existShop.logo.id,
                        original: existShop.logo.original,
                        thumbnail: existShop.logo.thumbnail,
                    }
                    : null,
                is_active: existShop.is_active,
                address: existShop.address
                    ? {
                        id: existShop.address.id,
                        street_address: existShop.address.street_address,
                        country: existShop.address.country,
                        city: existShop.address.city,
                        state: existShop.address.state,
                        zip: existShop.address.zip,
                        customer_id: existShop.address.customer_id,
                        created_at: existShop.address.created_at,
                        updated_at: existShop.address.updated_at
                    }
                    : null,
                settings: existShop.settings
                    ? {
                        id: existShop.settings.id,
                        contact: existShop.settings.contact,
                        website: existShop.settings.website,
                        socials: existShop.settings.socials,
                        location: existShop.settings.location,
                    }
                    : null,
                created_at: existShop.created_at,
                updated_at: existShop.updated_at,
                orders_count: existShop.orders_count,
                products_count: existShop.products_count,
                owner: existShop.owner
                    ? Object.assign(Object.assign({}, existShop.owner), { profile: (_c = existShop.owner.profile) !== null && _c !== void 0 ? _c : null, walletPoints: (_d = existShop.owner.walletPoints) !== null && _d !== void 0 ? _d : 0, contact: (_e = existShop.owner.contact) !== null && _e !== void 0 ? _e : '' }) : null,
                gst_number: (_f = existShop.gst_number) !== null && _f !== void 0 ? _f : '',
                categories: (_g = existShop.categories) !== null && _g !== void 0 ? _g : [],
                subCategories: (_h = existShop.subCategories) !== null && _h !== void 0 ? _h : [],
                orders: (_j = existShop.orders) !== null && _j !== void 0 ? _j : [],
                additionalPermissions: (_k = existShop.additionalPermissions) !== null && _k !== void 0 ? _k : [],
                permission: (_l = existShop.permission) !== null && _l !== void 0 ? _l : null,
                dealerCount: (_m = existShop === null || existShop === void 0 ? void 0 : existShop.dealerCount) !== null && _m !== void 0 ? _m : 0,
                regions: (_o = existShop.regions) !== null && _o !== void 0 ? _o : [],
                events: (_p = existShop.events) !== null && _p !== void 0 ? _p : [],
            };
            return mappedShop;
        }
        catch (error) {
            console.error(`Error fetching shop with slug '${slug}':`, error.message);
            return null;
        }
    }
    async update(id, updateShopDto) {
        var _a;
        const existingShop = await this.shopRepository.findOne({
            where: { id: id },
            relations: ["balance", "address", "settings", "settings.socials", "settings.location",
                'permission',
                'permission.permissions', "owner"]
        });
        if (!existingShop) {
            throw new common_1.NotFoundException(`Shop with ID ${id} not found`);
        }
        const existingCoverImageId = existingShop.cover_image;
        const existingLogoId = existingShop.logo;
        existingShop.cover_image = [];
        existingShop.logo = null;
        await this.shopRepository.save(existingShop);
        if (existingCoverImageId) {
            if (existingCoverImageId.length > 0) {
                await this.attachmentRepository.remove(existingCoverImageId);
            }
        }
        if (existingLogoId) {
            await this.attachmentRepository.delete(existingLogoId);
        }
        if (existingShop.permission.type_name === user_entity_1.UserType.Company) {
        }
        existingShop.name = updateShopDto.name;
        existingShop.slug = await this.convertToSlug(updateShopDto.name);
        existingShop.description = updateShopDto.description;
        existingShop.cover_image = updateShopDto.cover_image;
        existingShop.logo = updateShopDto.logo;
        existingShop.owner = updateShopDto.user;
        existingShop.owner_id = updateShopDto.user.id;
        if (updateShopDto.address) {
            const userAdd = new address_entity_1.UserAdd();
            userAdd.city = updateShopDto.address.city;
            userAdd.country = updateShopDto.address.country;
            userAdd.customer_id = existingShop === null || existingShop === void 0 ? void 0 : existingShop.owner.id;
            userAdd.state = updateShopDto.address.state;
            userAdd.street_address = updateShopDto.address.street_address;
            userAdd.zip = (_a = updateShopDto.address) === null || _a === void 0 ? void 0 : _a.zip;
            userAdd.created_at = updateShopDto.address.created_at;
            userAdd.updated_at = updateShopDto.address.updated_at;
            const updatedAddress = await this.userAddressRepository.save(userAdd);
            const address = new address_entity_1.Add();
            address.address = updatedAddress;
            address.title = `${updateShopDto.address.street_address + " " + updateShopDto.address.city + " " + updateShopDto.address.state}`;
            address.customer = existingShop === null || existingShop === void 0 ? void 0 : existingShop.owner;
            address.default = true;
            address.type = address_entity_1.AddressType.SHOP;
            address.created_at = new Date();
            address.updated_at = new Date();
            this.addressRepository.save(address);
            existingShop.address = await this.userAddressRepository.save(Object.assign(Object.assign({}, existingShop.address), updatedAddress));
        }
        if (updateShopDto.settings) {
            const setting = existingShop.settings;
            Object.assign(setting, updateShopDto.settings);
            if (updateShopDto.settings.socials) {
                const socials = [];
                for (const updateSocial of updateShopDto.settings.socials) {
                    const existingSocial = setting.socials.find((social) => social.icon === updateSocial.icon);
                    if (existingSocial) {
                        Object.assign(existingSocial, updateSocial);
                        const updatedSocial = await this.shopSocialsRepository.save(existingSocial);
                        socials.push(updatedSocial);
                    }
                    else {
                        const newSocial = this.shopSocialsRepository.create(updateSocial);
                        const savedSocial = await this.shopSocialsRepository.save(newSocial);
                        socials.push(savedSocial);
                    }
                }
                const socialsToRemove = setting.socials.filter((social) => !updateShopDto.settings.socials.some((updateSocial) => updateSocial.icon === social.icon));
                for (const social of socialsToRemove) {
                    await this.shopSocialsRepository.remove(social);
                }
                setting.socials = socials;
            }
            else {
                await this.shopSocialsRepository.remove(setting.socials);
                setting.socials = [];
            }
            if (updateShopDto.settings.location) {
                if (setting.location) {
                    Object.assign(setting.location, updateShopDto.settings.location);
                    setting.location = await this.locationRepository.save(setting.location);
                }
                else {
                    const newLocation = this.locationRepository.create(updateShopDto.settings.location);
                    setting.location = await this.locationRepository.save(newLocation);
                }
            }
            else if (setting.location) {
                await this.locationRepository.remove(setting.location);
                setting.location = null;
            }
            await this.shopSettingsRepository.save(setting);
            existingShop.settings = setting;
        }
        if (updateShopDto.balance) {
            const balance = await this.balanceRepository.findOne({
                where: { id: existingShop.balance.id },
                relations: ["payment_info"],
            });
            if (balance) {
                const payment = await this.paymentInfoRepository.findOne({
                    where: { id: balance.payment_info.id },
                });
                if (payment) {
                    payment.account = updateShopDto.balance.payment_info.account;
                    payment.bank = updateShopDto.balance.payment_info.bank;
                    payment.email = updateShopDto.balance.payment_info.email;
                    payment.name = updateShopDto.balance.payment_info.name;
                    await this.paymentInfoRepository
                        .createQueryBuilder("payment_info")
                        .update()
                        .set(payment)
                        .where("payment_info.id = :id", { id: balance.payment_info.id })
                        .execute();
                }
            }
        }
        existingShop.created_at = new Date();
        return await this.shopRepository.save(existingShop);
    }
    async changeShopStatus(id, status) {
        const shop = await this.shopRepository.findOne({ where: { id } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${id} not found`);
        }
        shop.is_active = status;
        return this.shopRepository.save(shop);
    }
    async remove(id) {
        const shop = await this.shopRepository.findOne({
            where: { id },
            relations: [
                "balance",
                "balance.payment_info",
                "settings",
                "settings.socials",
                "settings.location",
                "address"
            ]
        });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${id} not found`);
        }
        await this.shopRepository.remove(shop);
    }
    async disapproveShop(id) {
        const shop = await this.shopRepository.findOne({ where: { id } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${id} not found`);
        }
        shop.is_active = false;
        return this.shopRepository.save(shop);
    }
    async approveShop(approveShopDto) {
        const shop = await this.shopRepository.findOne({
            where: { id: approveShopDto.id },
            relations: [
                "balance",
                "balance.payment_info",
                "settings",
                "settings.socials",
                "settings.location"
            ]
        });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${approveShopDto.id} not found`);
        }
        shop.is_active = true;
        const balance = await this.balanceRepository.findOne({
            where: { id: shop.balance.id }
        });
        if (balance) {
            balance.admin_commission_rate = approveShopDto.admin_commission_rate;
            await this.balanceRepository.save(balance);
            shop.balance.admin_commission_rate = balance.admin_commission_rate;
        }
        return this.shopRepository.save(shop);
    }
};
ShopsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, typeorm_1.InjectRepository)(balance_entity_1.Balance)),
    __param(3, (0, typeorm_1.InjectRepository)(shopSettings_entity_1.ShopSettings)),
    __param(4, (0, typeorm_1.InjectRepository)(shop_entity_1.PaymentInfo)),
    __param(5, (0, typeorm_1.InjectRepository)(address_entity_1.Add)),
    __param(6, (0, typeorm_1.InjectRepository)(address_entity_1.UserAdd)),
    __param(7, (0, typeorm_1.InjectRepository)(setting_entity_1.ShopSocials)),
    __param(8, (0, typeorm_1.InjectRepository)(setting_entity_1.Location)),
    __param(9, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(10, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(11, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(13, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
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
        addresses_service_1.AddressesService, Object])
], ShopsService);
exports.ShopsService = ShopsService;
//# sourceMappingURL=shops.service.js.map
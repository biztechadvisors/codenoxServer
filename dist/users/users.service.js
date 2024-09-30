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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("./entities/user.entity");
const paginate_1 = require("../common/pagination/paginate");
const typeorm_1 = require("@nestjs/typeorm");
const profile_entity_1 = require("./entities/profile.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const dealer_entity_1 = require("./entities/dealer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const create_auth_dto_1 = require("../auth/dto/create-auth.dto");
const auth_service_1 = require("../auth/auth.service");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../permission/entities/permission.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const address_entity_1 = require("../address/entities/address.entity");
const addresses_service_1 = require("../address/addresses.service");
const create_address_dto_1 = require("../address/dto/create-address.dto");
const update_address_dto_1 = require("../address/dto/update-address.dto");
const analytics_service_1 = require("../analytics/analytics.service");
const delaerForEnquiry_entity_1 = require("./entities/delaerForEnquiry.entity");
let UsersService = class UsersService {
    constructor(userRepository, addressRepository, profileRepository, attachmentRepository, dealerRepository, productRepository, categoryRepository, dealerProductMarginRepository, dealerCategoryMarginRepository, shopRepository, socialRepository, permissionRepository, dealerEnquiryRepository, cacheManager, analyticsService, authService, addressesService) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.profileRepository = profileRepository;
        this.attachmentRepository = attachmentRepository;
        this.dealerRepository = dealerRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.dealerProductMarginRepository = dealerProductMarginRepository;
        this.dealerCategoryMarginRepository = dealerCategoryMarginRepository;
        this.shopRepository = shopRepository;
        this.socialRepository = socialRepository;
        this.permissionRepository = permissionRepository;
        this.dealerEnquiryRepository = dealerEnquiryRepository;
        this.cacheManager = cacheManager;
        this.analyticsService = analyticsService;
        this.authService = authService;
        this.addressesService = addressesService;
    }
    async create(createUserDto) {
        var _a, _b;
        const user = await this.userRepository.findOne({ where: { email: createUserDto.email }, relations: ['permission'] });
        if (user) {
            throw new common_1.NotFoundException(`User with email ${createUserDto.email} already exists`);
        }
        const registerDto = new create_auth_dto_1.RegisterDto();
        registerDto.name = createUserDto.name;
        registerDto.email = createUserDto.email;
        registerDto.password = createUserDto.password;
        registerDto.isVerified = createUserDto.isVerified;
        registerDto.permission = createUserDto.permission;
        await this.authService.register(registerDto);
        const usr = new user_entity_1.User();
        const shop = await this.shopRepository.findOne({ where: { id: (_a = createUserDto.managed_shop) === null || _a === void 0 ? void 0 : _a.id } });
        if (shop) {
            usr.shop_id = (_b = createUserDto.managed_shop) === null || _b === void 0 ? void 0 : _b.id;
        }
        usr.is_active = createUserDto.is_active;
        usr.permission = createUserDto.permission;
        usr.created_at = new Date();
        await this.userRepository.save(usr);
        if (Array.isArray(createUserDto.address)) {
            for (const addressData of createUserDto.address) {
                const createAddressDto = new create_address_dto_1.CreateAddressDto();
                createAddressDto.title = addressData.title;
                createAddressDto.type = addressData.type;
                createAddressDto.default = addressData.default;
                createAddressDto.address = addressData.address;
                createAddressDto.customer_id = usr.id;
                await this.addressesService.create(createAddressDto);
            }
        }
        const social = new profile_entity_1.Social();
        social.link = createUserDto.profile.socials.link;
        social.type = createUserDto.profile.socials.type;
        await this.socialRepository.save(social);
        const profile = new profile_entity_1.Profile();
        profile.customer = usr;
        profile.socials = social;
        profile.bio = createUserDto.profile.bio;
        profile.contact = createUserDto.profile.contact;
        let profUsr = await this.profileRepository.save(profile);
        usr.profile = profUsr;
        await this.userRepository.save(usr);
        return usr;
    }
    async getUsers({ searchJoin = 'and', limit = 30, page = 1, name, orderBy, sortedBy, usrById, search, type, }) {
        if (!usrById && !type) {
            const emptyUserPaginator = {
                data: [],
                count: 0,
                current_page: 1,
                firstItem: null,
                lastItem: null,
                last_page: 1,
                per_page: 10,
                total: 0,
                first_page_url: null,
                last_page_url: null,
                next_page_url: null,
                prev_page_url: null,
            };
            return emptyUserPaginator;
        }
        const limitNum = limit;
        const pageNum = page;
        const startIndex = (pageNum - 1) * limitNum;
        const cacheKey = `users_${JSON.stringify({
            searchJoin,
            limit,
            page,
            name,
            orderBy,
            sortedBy,
            usrById,
            search,
            type,
        })}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        let user;
        if (usrById) {
            user = await this.userRepository.findOne({
                where: { id: Number(usrById) },
                relations: [
                    'profile',
                    'dealer',
                    'owned_shops',
                    'managed_shop',
                    'address',
                    'permission',
                ],
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${usrById} not found`);
            }
        }
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        queryBuilder
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('user.dealer', 'dealer')
            .leftJoinAndSelect('user.owned_shops', 'owned_shops')
            .leftJoinAndSelect('user.managed_shop', 'managed_shop')
            .leftJoinAndSelect('user.address', 'address')
            .leftJoinAndSelect('user.permission', 'permission');
        queryBuilder.skip(startIndex).take(limitNum);
        if (orderBy && sortedBy) {
            queryBuilder.addOrderBy(`user.${orderBy}`, sortedBy.toUpperCase());
        }
        if (usrById) {
            queryBuilder.andWhere('user.createdById = :usrById', { usrById });
            if (type) {
                const permissions = await this.permissionRepository.find({
                    where: {
                        type_name: type,
                        user: Number(usrById),
                    },
                });
                if (permissions.length === 0) {
                    throw new common_1.NotFoundException(`Permission for type "${type}" not found.`);
                }
                const permissionIds = permissions.map((p) => p.id);
                queryBuilder.andWhere('user.permission_id IN (:...permissionIds)', { permissionIds });
            }
        }
        if (name) {
            queryBuilder.andWhere('user.name LIKE :name', { name: `%${name}%` });
        }
        if (search) {
            const searchConditions = [];
            const searchParams = {};
            const filterTerms = search.split(' ');
            filterTerms.forEach((term, index) => {
                const searchTermKey = `searchTerm${index}`;
                const searchTermValue = `%${term}%`;
                searchConditions.push(`(user.name LIKE :${searchTermKey} OR user.email LIKE :${searchTermKey} OR user.contact LIKE :${searchTermKey})`);
                searchParams[searchTermKey] = searchTermValue;
            });
            if (searchJoin.toLowerCase() === 'or') {
                queryBuilder.andWhere(new typeorm_2.Brackets(qb => {
                    qb.where(searchConditions.join(' OR '), searchParams);
                }));
            }
            else {
                searchConditions.forEach((condition, index) => {
                    queryBuilder.andWhere(condition, searchParams);
                });
            }
        }
        const [users, total] = await queryBuilder.getManyAndCount();
        const isCompanyOrStaff = user && (user.permission.type_name === user_entity_1.UserType.Company || user.permission.type_name === user_entity_1.UserType.Staff);
        const url = `/users?type=${type || 'customer'}&limit=${limitNum}`;
        const result = Object.assign({ data: isCompanyOrStaff ? [...users] : [user, ...users] }, (0, paginate_1.paginate)(total, pageNum, limitNum, total, url));
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
    async findOne(id) {
        const cacheKey = `user_${id}`;
        const cachedUser = await this.cacheManager.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['profile', 'address', 'owned_shops', 'orders', 'address.address', 'permission'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        await this.cacheManager.set(cacheKey, user, 60);
        return user;
    }
    async update(id, updateUserDto) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ["profile", "address", "owned_shops", "orders", "profile.socials", "permission"]
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        user.name = (_a = updateUserDto.name) !== null && _a !== void 0 ? _a : user.name;
        user.email = (_b = updateUserDto.email) !== null && _b !== void 0 ? _b : user.email;
        user.password = (_c = updateUserDto.password) !== null && _c !== void 0 ? _c : user.password;
        user.isVerified = updateUserDto.isVerified !== undefined ? updateUserDto.isVerified : user.isVerified;
        user.is_active = updateUserDto.is_active !== undefined ? updateUserDto.is_active : user.is_active;
        user.permission = updateUserDto.permission || user.permission;
        if ((_d = updateUserDto.managed_shop) === null || _d === void 0 ? void 0 : _d.id) {
            const shop = await this.shopRepository.findOne({ where: { id: updateUserDto.managed_shop.id } });
            if (shop) {
                user.managed_shop = shop;
            }
        }
        if (Array.isArray(updateUserDto.address)) {
            for (const addressData of updateUserDto.address) {
                if (addressData.address && addressData.address.id) {
                    let address = await this.addressRepository.findOne({ where: { id: addressData.address.id } });
                    if (address) {
                        const updateAddressDto = new update_address_dto_1.UpdateAddressDto();
                        updateAddressDto.title = addressData.title;
                        updateAddressDto.type = addressData.type;
                        updateAddressDto.default = addressData.default;
                        updateAddressDto.address = addressData.address;
                        updateAddressDto.customer_id = user.id;
                        await this.addressesService.update(address.id, updateAddressDto);
                    }
                }
                else {
                    const createAddressDto = new create_address_dto_1.CreateAddressDto();
                    createAddressDto.title = addressData.title;
                    createAddressDto.type = addressData.type;
                    createAddressDto.default = addressData.default;
                    createAddressDto.address = addressData.address;
                    createAddressDto.customer_id = user.id;
                    await this.addressesService.create(createAddressDto);
                }
            }
        }
        let profile = await this.profileRepository.findOne({ where: { customer: { id } } });
        if (!profile) {
            profile = this.profileRepository.create({
                customer: user,
                bio: (_e = updateUserDto.profile) === null || _e === void 0 ? void 0 : _e.bio,
                contact: (_f = updateUserDto.profile) === null || _f === void 0 ? void 0 : _f.contact
            });
        }
        else {
            profile.bio = (_h = (_g = updateUserDto.profile) === null || _g === void 0 ? void 0 : _g.bio) !== null && _h !== void 0 ? _h : profile.bio;
            profile.contact = (_k = (_j = updateUserDto.profile) === null || _j === void 0 ? void 0 : _j.contact) !== null && _k !== void 0 ? _k : profile.contact;
        }
        if ((_l = updateUserDto.profile) === null || _l === void 0 ? void 0 : _l.socials) {
            let social = await this.socialRepository.findOne({ where: { id: (_m = profile.socials) === null || _m === void 0 ? void 0 : _m.id } });
            if (social) {
                social.type = (_o = updateUserDto.profile.socials.type) !== null && _o !== void 0 ? _o : social.type;
                social.link = (_p = updateUserDto.profile.socials.link) !== null && _p !== void 0 ? _p : social.link;
            }
            else {
                social = this.socialRepository.create({
                    type: updateUserDto.profile.socials.type,
                    link: updateUserDto.profile.socials.link,
                });
            }
            await this.socialRepository.save(social);
            profile.socials = social;
        }
        await this.userRepository.save(user);
        await this.profileRepository.save(profile);
        return user;
    }
    async removeUser(id) {
        const user = await this.userRepository.findOne({
            where: { id: id }, relations: ["profile", "address", "owned_shops", "orders", "permission"]
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        await Promise.all(user.address.map(address => this.addressesService.remove(address.id)));
        await this.profileRepository.remove(user.profile);
        await this.shopRepository.remove(user.owned_shops);
        await this.userRepository.remove(user);
        return `User with id ${id} has been removed`;
    }
    async makeAdmin(user_id) {
        const user = await this.userRepository.findOne({ where: { id: user_id }, relations: ['permission'] });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${user_id} not found`);
        }
        const usr_type = await this.permissionRepository.findOne({ where: { user: user.id } });
        usr_type.type_name = user_entity_1.UserType.Staff;
        await this.userRepository.save(user);
        return user;
    }
    async banUser(id) {
        const user = await this.userRepository.findOne({ where: { id: id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        user.is_active = false;
        await this.userRepository.save(user);
        return user;
    }
    async activeUser(id) {
        const user = await this.userRepository.findOne({ where: { id: id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        }
        user.is_active = !user.is_active;
        await this.userRepository.save(user);
        return user;
    }
    async createDealer(dealerData) {
        const user = await this.userRepository.findOne({ where: { id: dealerData.user.id }, relations: ['permission'] });
        if (!user || user.permission.type_name !== user_entity_1.UserType.Dealer) {
            throw new common_1.NotFoundException(`User with ID ${dealerData.user.id} not found or is not a Dealer`);
        }
        const dealer = new dealer_entity_1.Dealer();
        dealer.name = dealerData.name;
        dealer.phone = dealerData.phone;
        dealer.subscriptionType = dealerData.subscriptionType;
        dealer.subscriptionStart = dealerData.subscriptionStart;
        dealer.subscriptionEnd = dealerData.subscriptionEnd;
        dealer.discount = dealerData.discount;
        dealer.walletBalance = dealerData.walletBalance;
        dealer.isActive = dealerData.isActive;
        dealer.gst = dealerData.gst;
        dealer.pan = dealerData.pan;
        dealer.user = user;
        const savedDealer = await this.dealerRepository.save(dealer);
        user.dealer = savedDealer;
        await this.userRepository.save(user);
        for (const marginData of dealerData.dealerProductMargins) {
            const product = await this.productRepository.findOne({ where: { id: marginData.product.id } });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${marginData.product.id} not found`);
            }
            const margin = new dealer_entity_1.DealerProductMargin();
            margin.product = product;
            margin.margin = marginData.margin;
            margin.isActive = marginData.isActive;
            margin.dealer = savedDealer;
            await this.dealerProductMarginRepository.save(margin);
        }
        for (const marginData of dealerData.dealerCategoryMargins) {
            const category = await this.categoryRepository.findOne({ where: { id: marginData.category.id } });
            if (!category) {
                throw new common_1.NotFoundException(`Category with ID ${marginData.category.id} not found`);
            }
            const margin = new dealer_entity_1.DealerCategoryMargin();
            margin.category = category;
            margin.margin = marginData.margin;
            margin.isActive = marginData.isActive;
            margin.dealer = savedDealer;
            await this.dealerCategoryMarginRepository.save(margin);
        }
        delete savedDealer.user.dealer;
        await this.analyticsService.updateAnalytics(undefined, undefined, undefined, user);
        return savedDealer;
    }
    async getAllDealers(createdBy) {
        const cacheKey = `dealers_${createdBy || 'all'}`;
        let dealers = await this.cacheManager.get(cacheKey);
        if (!dealers) {
            const findOptions = {
                relations: [
                    'user',
                    'dealerProductMargins',
                    'dealerProductMargins.product',
                    'dealerCategoryMargins',
                    'dealerCategoryMargins.category'
                ],
            };
            if (createdBy) {
                const user = await this.userRepository.findOne({ where: { id: createdBy } });
                if (!user) {
                    throw new common_1.NotFoundException(`User with ID ${createdBy} not found`);
                }
                findOptions['where'] = { user: { createdBy: { id: createdBy } } };
            }
            dealers = await this.dealerRepository.find(findOptions);
            await this.cacheManager.set(cacheKey, dealers, 60);
        }
        return dealers;
    }
    async getDealerById(id) {
        const cacheKey = `dealer_${id}`;
        let dealer = await this.cacheManager.get(cacheKey);
        if (!dealer) {
            dealer = await this.dealerRepository.findOne({
                where: { user: { id } },
                relations: [
                    'user',
                    'dealerProductMargins',
                    'dealerProductMargins.product',
                    'dealerCategoryMargins',
                    'dealerCategoryMargins.category',
                ],
            });
            if (!dealer) {
                throw new common_1.NotFoundException(`Dealer with user ID ${id} not found`);
            }
            await this.cacheManager.set(cacheKey, dealer, 60);
        }
        return dealer;
    }
    async updateDealer(id, dealerData) {
        const dealer = await this.dealerRepository.findOne({ where: { id: id }, relations: ['user', 'dealerProductMargins', 'dealerProductMargins.product', 'dealerCategoryMargins', 'dealerCategoryMargins.category'] });
        if (!dealer) {
            throw new common_1.NotFoundException(`Dealer with ID ${id} not found`);
        }
        dealer.name = dealerData.name;
        dealer.phone = dealerData.phone;
        dealer.subscriptionType = dealerData.subscriptionType;
        dealer.subscriptionStart = dealerData.subscriptionStart;
        dealer.subscriptionEnd = dealerData.subscriptionEnd;
        dealer.discount = dealerData.discount;
        dealer.walletBalance = dealerData.walletBalance;
        dealer.isActive = dealerData.isActive;
        dealer.gst = dealerData.gst;
        dealer.pan = dealerData.pan;
        for (const marginData of dealerData.dealerProductMargins) {
            if (!marginData.product || !marginData.product.id)
                continue;
            let margin = dealer.dealerProductMargins.find(m => m.product.id === marginData.product.id);
            if (!margin) {
                margin = new dealer_entity_1.DealerProductMargin();
                margin.product = await this.productRepository.findOne({ where: { id: marginData.product.id } });
                margin.dealer = dealer;
                dealer.dealerProductMargins.push(margin);
            }
            margin.margin = marginData.margin;
            margin.isActive = marginData.isActive;
            await this.dealerProductMarginRepository.save(margin);
        }
        const existingProductMarginIds = dealer.dealerProductMargins.map(m => m.product.id);
        const updateProductMarginIds = dealerData.dealerProductMargins.map(md => md.product && md.product.id);
        const productMarginIdsToRemove = existingProductMarginIds.filter(id => !updateProductMarginIds.includes(id));
        for (const id of productMarginIdsToRemove) {
            const marginToRemove = dealer.dealerProductMargins.find(m => m.product.id === id);
            await this.dealerProductMarginRepository.remove(marginToRemove);
        }
        for (const marginData of dealerData.dealerCategoryMargins) {
            if (!marginData.category || !marginData.category.id)
                continue;
            let margin = dealer.dealerCategoryMargins.find(m => m.category.id === marginData.category.id);
            if (!margin) {
                margin = new dealer_entity_1.DealerCategoryMargin();
                margin.category = await this.categoryRepository.findOne({ where: { id: marginData.category.id } });
                margin.dealer = dealer;
                dealer.dealerCategoryMargins.push(margin);
            }
            margin.margin = marginData.margin;
            margin.isActive = marginData.isActive;
            await this.dealerCategoryMarginRepository.save(margin);
        }
        const existingCategoryMarginIds = dealer.dealerCategoryMargins.map(m => m.category.id);
        const updateCategoryMarginIds = dealerData.dealerCategoryMargins.map(md => md.category && md.category.id);
        const categoryMarginIdsToRemove = existingCategoryMarginIds.filter(id => !updateCategoryMarginIds.includes(id));
        for (const id of categoryMarginIdsToRemove) {
            const marginToRemove = dealer.dealerCategoryMargins.find(m => m.category.id === id);
            await this.dealerCategoryMarginRepository.remove(marginToRemove);
        }
        dealer.dealerProductMargins.forEach(margin => {
            delete margin.dealer;
        });
        dealer.dealerCategoryMargins.forEach(margin => {
            delete margin.dealer;
        });
        return this.dealerRepository.save(dealer);
    }
    async deleteDealer(id) {
        const dealer = await this.dealerRepository.findOne({ where: { user: { id } }, relations: ['user', 'dealerProductMargins', 'dealerCategoryMargins'] });
        if (!dealer) {
            throw new common_1.NotFoundException(`Dealer with ID ${id} not found`);
        }
        for (const margin of dealer.dealerProductMargins) {
            await this.dealerProductMarginRepository.delete(margin.id);
        }
        for (const margin of dealer.dealerCategoryMargins) {
            await this.dealerCategoryMarginRepository.delete(margin.id);
        }
        dealer.dealerProductMargins.forEach(margin => {
            delete margin.dealer;
        });
        dealer.dealerCategoryMargins.forEach(margin => {
            delete margin.dealer;
        });
        await this.dealerRepository.delete(dealer.id);
    }
    async createProfile(createProfileDto) {
        return;
    }
    async updateProfile(updateProfileDto) {
        return;
    }
    async CreateDealerEnquiry(createDealerEnquiryDto) {
        const shop = await this.shopRepository.findOne({ where: { slug: createDealerEnquiryDto.shopSlug } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const dealerEnquiry = this.dealerEnquiryRepository.create(Object.assign(Object.assign({}, createDealerEnquiryDto), { shop }));
        return await this.dealerEnquiryRepository.save(dealerEnquiry);
    }
    async findAllDealerEnquiry(shopSlug) {
        const cacheKey = `dealerEnquiries_${shopSlug}_all`;
        let cachedDealerEnquiries = await this.cacheManager.get(cacheKey);
        if (cachedDealerEnquiries) {
            return cachedDealerEnquiries;
        }
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new common_1.NotFoundException('Shop not found');
        }
        const dealerEnquiries = await this.dealerEnquiryRepository.find({ where: { shop: { id: shop.id } } });
        await this.cacheManager.set(cacheKey, dealerEnquiries, 300);
        return dealerEnquiries;
    }
    async findOneDealerEnquiry(id) {
        const cacheKey = `dealerEnquiry_${id}`;
        let cachedDealerEnquiry = await this.cacheManager.get(cacheKey);
        if (cachedDealerEnquiry) {
            return cachedDealerEnquiry;
        }
        const enquiry = await this.dealerEnquiryRepository.findOne({ where: { id } });
        if (!enquiry) {
            throw new common_1.NotFoundException('Dealer enquiry not found');
        }
        await this.cacheManager.set(cacheKey, enquiry, 300);
        return enquiry;
    }
    async updateDealerEnquiry(id, updateDealerEnquiryDto) {
        const enquiry = await this.findOneDealerEnquiry(id);
        Object.assign(enquiry, updateDealerEnquiryDto);
        return await this.dealerEnquiryRepository.save(enquiry);
    }
    async removeDealerEnquiry(id) {
        const enquiry = await this.findOneDealerEnquiry(id);
        await this.dealerEnquiryRepository.remove(enquiry);
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(address_entity_1.Add)),
    __param(2, (0, typeorm_1.InjectRepository)(profile_entity_1.Profile)),
    __param(3, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(4, (0, typeorm_1.InjectRepository)(dealer_entity_1.Dealer)),
    __param(5, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(6, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(7, (0, typeorm_1.InjectRepository)(dealer_entity_1.DealerProductMargin)),
    __param(8, (0, typeorm_1.InjectRepository)(dealer_entity_1.DealerCategoryMargin)),
    __param(9, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(10, (0, typeorm_1.InjectRepository)(profile_entity_1.Social)),
    __param(11, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(12, (0, typeorm_1.InjectRepository)(delaerForEnquiry_entity_1.DealerEnquiry)),
    __param(13, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
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
        typeorm_2.Repository, Object, analytics_service_1.AnalyticsService,
        auth_service_1.AuthService,
        addresses_service_1.AddressesService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map
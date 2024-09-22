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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const createcontact_entitiy_1 = require("./entity/createcontact.entitiy");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let ContactService = class ContactService {
    constructor(contactRepository, shopRepository, cacheManager) {
        this.contactRepository = contactRepository;
        this.shopRepository = shopRepository;
        this.cacheManager = cacheManager;
    }
    async create(createContactDto) {
        const { shopSlug } = createContactDto, contactData = __rest(createContactDto, ["shopSlug"]);
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${shopSlug} not found`);
        }
        const contact = this.contactRepository.create(Object.assign(Object.assign({}, contactData), { shop }));
        return this.contactRepository.save(contact);
    }
    async findAllByShop(shopSlug, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with slug ${shopSlug} not found`);
        }
        const cacheKey = `contacts_${shopSlug}_page_${page}_limit_${limit}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return Object.assign(Object.assign({}, cachedData), { page,
                limit });
        }
        const [data, total] = await this.contactRepository.findAndCount({
            where: { shop: { id: shop.id } },
            relations: ['shop'],
            skip,
            take: limit,
        });
        const result = { data, total, page, limit };
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
    async findOne(id) {
        const contact = await this.contactRepository.findOne({ where: { id }, relations: ['shop'] });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID ${id} not found`);
        }
        return contact;
    }
    async update(id, updateContactDto) {
        const contact = await this.findOne(id);
        const { shopSlug } = updateContactDto, updateData = __rest(updateContactDto, ["shopSlug"]);
        if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${shopSlug} not found`);
            }
            contact.shop = shop;
        }
        Object.assign(contact, updateData);
        return this.contactRepository.save(contact);
    }
    async remove(id) {
        const contact = await this.findOne(id);
        await this.contactRepository.remove(contact);
    }
};
ContactService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(createcontact_entitiy_1.Contact)),
    __param(1, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object])
], ContactService);
exports.ContactService = ContactService;
//# sourceMappingURL=contact.service.js.map
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
exports.GetInspiredService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const get_inspired_entity_1 = require("./entities/get-inspired.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const tag_entity_1 = require("../tags/entities/tag.entity");
let GetInspiredService = class GetInspiredService {
    constructor(getInspiredRepository, attachmentRepository, shopRepository, tagRepository, cacheManager) {
        this.getInspiredRepository = getInspiredRepository;
        this.attachmentRepository = attachmentRepository;
        this.shopRepository = shopRepository;
        this.tagRepository = tagRepository;
        this.cacheManager = cacheManager;
    }
    async createGetInspired(createGetInspiredDto) {
        const { title, type, shopId, imageIds = [], tagIds = [] } = createGetInspiredDto;
        const shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
        }
        const images = await this.attachmentRepository.findByIds(imageIds);
        const tags = await this.tagRepository.findByIds(tagIds);
        const getInspired = this.getInspiredRepository.create({
            title,
            type,
            shop,
            images,
            tags,
        });
        return this.getInspiredRepository.save(getInspired);
    }
    async getAllGetInspired(shopSlug, type, tagIds = [], page = 1, limit = 10) {
        const cacheKey = `get-inspired-shop-${shopSlug}-type-${type || 'all'}-tags-${tagIds.join(',')}-page-${page}-limit-${limit}`;
        let cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return Object.assign(Object.assign({}, cachedResult), { page,
                limit });
        }
        const queryBuilder = this.getInspiredRepository.createQueryBuilder('getInspired')
            .innerJoinAndSelect('getInspired.shop', 'shop', 'shop.slug = :slug', { slug: shopSlug })
            .leftJoinAndSelect('getInspired.images', 'images')
            .leftJoinAndSelect('getInspired.tags', 'tags');
        if (type) {
            queryBuilder.andWhere('getInspired.type = :type', { type });
        }
        if (tagIds.length > 0) {
            queryBuilder.andWhere('tags.id IN (:...tagIds)', { tagIds });
        }
        const skip = (page - 1) * limit;
        const [data, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const result = { data, total, page, limit };
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
    async getGetInspiredById(id) {
        const cacheKey = `get-inspired-${id}`;
        let getInspired = await this.cacheManager.get(cacheKey);
        if (!getInspired) {
            getInspired = await this.getInspiredRepository.findOne({
                where: { id },
                relations: ['shop', 'images'],
            });
            if (!getInspired) {
                throw new common_1.NotFoundException(`GetInspired with ID ${id} not found`);
            }
            await this.cacheManager.set(cacheKey, getInspired, 60);
        }
        return getInspired;
    }
    async updateGetInspired(id, updateGetInspiredDto) {
        const getInspired = await this.getInspiredRepository.findOne({ where: { id }, relations: ['tags'] });
        if (!getInspired) {
            throw new common_1.NotFoundException(`GetInspired with ID ${id} not found`);
        }
        const { title, type, imageIds, tagIds } = updateGetInspiredDto;
        if (title)
            getInspired.title = title;
        if (type)
            getInspired.type = type;
        if (imageIds) {
            getInspired.images = await this.attachmentRepository.findByIds(imageIds);
        }
        if (tagIds) {
            getInspired.tags = await this.tagRepository.findByIds(tagIds);
        }
        return this.getInspiredRepository.save(getInspired);
    }
    async deleteGetInspired(id) {
        const result = await this.getInspiredRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`GetInspired with ID ${id} not found`);
        }
    }
};
GetInspiredService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(get_inspired_entity_1.GetInspired)),
    __param(1, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(3, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(4, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], GetInspiredService);
exports.GetInspiredService = GetInspiredService;
//# sourceMappingURL=get-inspired.service.js.map
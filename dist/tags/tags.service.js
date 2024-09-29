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
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const paginate_1 = require("../common/pagination/paginate");
const tag_entity_1 = require("./entities/tag.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const type_entity_1 = require("../types/entities/type.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
const cacheService_1 = require("../helpers/cacheService");
let TagsService = class TagsService {
    constructor(tagRepository, attachmentRepository, typeRepository, shopRepository, regionRepository, cacheManager, cacheService) {
        this.tagRepository = tagRepository;
        this.attachmentRepository = attachmentRepository;
        this.typeRepository = typeRepository;
        this.shopRepository = shopRepository;
        this.regionRepository = regionRepository;
        this.cacheManager = cacheManager;
        this.cacheService = cacheService;
    }
    async create(createTagDto) {
        const { name, icon, details, language, translatedLanguages, shopSlug, image, type_id, parent, region_name } = createTagDto;
        const shopRes = await this.shopRepository.findOne({ where: { slug: shopSlug } });
        if (!shopRes) {
            throw new common_1.NotFoundException(`Shop with slug ${shopSlug} not found`);
        }
        let imageRes = null;
        if (image === null || image === void 0 ? void 0 : image.id) {
            imageRes = await this.attachmentRepository.findOne({ where: { id: image.id } });
            if (!imageRes) {
                throw new common_1.NotFoundException(`Image with ID ${image.id} not found`);
            }
        }
        let typeRes = null;
        if (type_id) {
            typeRes = await this.typeRepository.findOne({ where: { id: type_id } });
            if (!typeRes) {
                throw new common_1.NotFoundException(`Type with ID ${type_id} not found`);
            }
        }
        let regions;
        if (createTagDto.region_name) {
            regions = await this.regionRepository.find({
                where: {
                    name: (0, typeorm_2.In)(createTagDto.region_name),
                },
            });
        }
        if (regions.length !== createTagDto.region_name.length) {
            const missingRegionNames = createTagDto.region_name.filter((name) => !regions.some((region) => region.name === name));
            throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
        }
        const tag = new tag_entity_1.Tag();
        tag.name = name;
        tag.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        tag.parent = parent;
        tag.details = details;
        tag.icon = icon;
        tag.language = language;
        tag.translatedLanguages = translatedLanguages;
        tag.image = imageRes;
        tag.shop = shopRes;
        tag.type = typeRes;
        tag.regions = regions;
        return await this.tagRepository.save(tag);
    }
    async findAll(query) {
        let { limit = '10', page = '1', search, shopSlug, region_name } = query;
        const numericPage = Number(page);
        const numericLimit = Number(limit);
        if (isNaN(numericPage) || isNaN(numericLimit) || numericPage < 1 || numericLimit < 1) {
            throw new common_1.BadRequestException('Page and limit values must be positive numbers');
        }
        const skip = (numericPage - 1) * numericLimit;
        const regionNames = typeof region_name === 'string' && region_name.trim().length > 1 ? [region_name] : Array.isArray(region_name) ? region_name : [];
        const cacheKey = `tags_${numericPage}_${numericLimit}_${search || 'none'}_${shopSlug || 'none'}_${regionNames.join(',')}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        let shopId;
        let regionIds = [];
        if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new common_1.BadRequestException(`Shop with slug ${shopSlug} not found`);
            }
            shopId = shop.id;
        }
        if (regionNames.length > 0) {
            const regions = await this.regionRepository.find({
                where: { name: (0, typeorm_2.In)(regionNames) },
            });
            if (regions.length !== regionNames.length) {
                const missingRegionNames = regionNames.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.BadRequestException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            regionIds = regions.map(region => region.id);
        }
        const queryBuilder = this.tagRepository.createQueryBuilder('tag')
            .leftJoinAndSelect('tag.image', 'image')
            .leftJoinAndSelect('tag.type', 'type')
            .leftJoinAndSelect('tag.regions', 'region')
            .take(numericLimit)
            .skip(skip);
        if (shopId) {
            queryBuilder.andWhere('tag.shopId = :shopId', { shopId });
        }
        if (regionIds.length > 0) {
            queryBuilder.andWhere('region.id IN (:...regionIds)', { regionIds });
        }
        if (search) {
            const searchPattern = `%${search.toLowerCase()}%`;
            queryBuilder.andWhere('LOWER(tag.name) LIKE :search', { search: searchPattern });
        }
        console.log(queryBuilder.getSql());
        const [data, total] = await queryBuilder.getManyAndCount();
        const formattedData = data.map((item) => {
            var _a;
            return (Object.assign(Object.assign({}, item), { type_id: ((_a = item.type) === null || _a === void 0 ? void 0 : _a.id) || null }));
        });
        const url = `/tags?search=${search}&limit=${numericLimit}&shopSlug=${shopSlug}&region_name=${regionNames.join(',')}`;
        const response = Object.assign({ data: formattedData }, (0, paginate_1.paginate)(total, numericPage, numericLimit, formattedData.length, url));
        await this.cacheManager.set(cacheKey, response, 60);
        return response;
    }
    async findOne(param, language) {
        const cacheKey = `tag_${param}_${language}`;
        const cachedTag = await this.cacheManager.get(cacheKey);
        if (cachedTag) {
            return cachedTag;
        }
        const isNumeric = !isNaN(parseFloat(param)) && isFinite(Number(param));
        const whereCondition = isNumeric ? { id: Number(param) } : { slug: param };
        const tag = await this.tagRepository.findOne({
            where: whereCondition,
            relations: ['image', 'type'],
        });
        if (!tag) {
            throw new Error(`Tag with ID or slug ${param} not found`);
        }
        await this.cacheManager.set(cacheKey, tag, 60);
        return tag;
    }
    async update(id, updateTagDto) {
        var _a, _b, _c;
        const tag = await this.tagRepository.findOne({
            where: { id },
            relations: ['image', 'type', 'regions'],
        });
        if (!tag) {
            throw new common_1.NotFoundException(`Tag with ID ${id} not found`);
        }
        if (((_a = updateTagDto.image) === null || _a === void 0 ? void 0 : _a.id) && updateTagDto.image.id !== ((_b = tag.image) === null || _b === void 0 ? void 0 : _b.id)) {
            const referencingTags = await this.tagRepository.find({
                where: { image: tag.image },
            });
            if (referencingTags.length === 1) {
                const oldImage = tag.image;
                tag.image = null;
                await this.tagRepository.save(tag);
                await this.attachmentRepository.remove(oldImage);
            }
            const newImage = await this.attachmentRepository.findOne({
                where: { id: updateTagDto.image.id },
            });
            if (!newImage) {
                throw new common_1.NotFoundException('New image not found');
            }
            tag.image = newImage;
        }
        if (updateTagDto.type_id && updateTagDto.type_id !== ((_c = tag.type) === null || _c === void 0 ? void 0 : _c.id)) {
            const type = await this.typeRepository.findOne({
                where: { id: updateTagDto.type_id },
            });
            if (!type) {
                throw new common_1.NotFoundException('Type not found');
            }
            tag.type = type;
        }
        if (updateTagDto.region_name && updateTagDto.region_name.length > 0) {
            const regions = await this.regionRepository.find({
                where: { name: (0, typeorm_2.In)(updateTagDto.region_name) },
            });
            if (regions.length !== updateTagDto.region_name.length) {
                const missingRegionNames = updateTagDto.region_name.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            tag.regions = regions;
        }
        tag.name = updateTagDto.name;
        tag.slug = updateTagDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        tag.parent = updateTagDto.parent;
        tag.details = updateTagDto.details;
        tag.icon = updateTagDto.icon;
        tag.language = updateTagDto.language;
        tag.translatedLanguages = updateTagDto.translatedLanguages;
        return this.tagRepository.save(tag);
    }
    async remove(id) {
        const tag = await this.tagRepository.findOne({ where: { id }, relations: ['image', 'type'] });
        if (!tag) {
            throw new Error(`Tag with ID ${id} not found`);
        }
        await this.tagRepository.remove(tag);
        const relatedTagsImage = await this.tagRepository.findOne({ where: { image: tag.image } });
        if (!relatedTagsImage) {
            await this.attachmentRepository.remove(tag.image);
        }
    }
};
TagsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(1, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(2, (0, typeorm_1.InjectRepository)(type_entity_1.Type)),
    __param(3, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(4, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(5, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object, cacheService_1.CacheService])
], TagsService);
exports.TagsService = TagsService;
//# sourceMappingURL=tags.service.js.map
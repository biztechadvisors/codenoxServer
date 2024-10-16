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
exports.TypesService = void 0;
const common_1 = require("@nestjs/common");
const type_entity_1 = require("./entities/type.entity");
const fuse_js_1 = __importDefault(require("fuse.js"));
const typeorm_1 = require("@nestjs/typeorm");
const helpers_1 = require("../helpers");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const uploads_service_1 = require("../uploads/uploads.service");
const shop_entity_1 = require("../shops/entities/shop.entity");
const typeorm_2 = require("typeorm");
const tag_entity_1 = require("../tags/entities/tag.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const product_entity_1 = require("../products/entities/product.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
let TypesService = class TypesService {
    constructor(uploadsService, typeRepository, typeSettingsRepository, bannerRepository, attachmentRepository, shopRepository, tagRepository, categoryRepository, productRepository, regionRepository, cacheManager) {
        this.uploadsService = uploadsService;
        this.typeRepository = typeRepository;
        this.typeSettingsRepository = typeSettingsRepository;
        this.bannerRepository = bannerRepository;
        this.attachmentRepository = attachmentRepository;
        this.shopRepository = shopRepository;
        this.tagRepository = tagRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.regionRepository = regionRepository;
        this.cacheManager = cacheManager;
    }
    async convertToSlug(text) {
        return await (0, helpers_1.convertToSlug)(text);
    }
    async findAll(query) {
        const { text, search, shop_id, shopSlug, region_name } = query;
        const cacheKey = `types_${shop_id || 'none'}_${shopSlug || 'none'}_${text || 'none'}_${search || 'none'}_${region_name || 'none'}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }
        const queryBuilder = this.typeRepository.createQueryBuilder('type')
            .leftJoinAndSelect('type.settings', 'settings')
            .leftJoinAndSelect('type.promotional_sliders', 'promotional_sliders')
            .leftJoinAndSelect('type.banners', 'banners')
            .leftJoinAndSelect('banners.image', 'banner_image')
            .leftJoinAndSelect('type.regions', 'regions');
        if (shop_id) {
            queryBuilder.andWhere('type.shopId = :shopId', { shopId: shop_id });
        }
        else if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            queryBuilder.andWhere('type.shopId = :shopId', { shopId: shop.id });
        }
        if (region_name) {
            queryBuilder.andWhere('regions.name = :regionName', { regionName: region_name });
        }
        let data = await queryBuilder.getMany();
        const fuse = new fuse_js_1.default(data, { keys: ['name', 'slug'] });
        if (text && text.replace(/%/g, '').length) {
            data = fuse.search(text).map(({ item }) => item);
        }
        if (search) {
            const parseSearchParams = search.split(';');
            const searchConditions = [];
            for (const searchParam of parseSearchParams) {
                const [key, value] = searchParam.split(':');
                if (key !== 'slug') {
                    searchConditions.push({ [key]: value });
                }
            }
            data = fuse.search({ $and: searchConditions }).map(({ item }) => item);
        }
        await this.cacheManager.set(cacheKey, data, 3600);
        return data;
    }
    async getTypeBySlug(slug) {
        const cacheKey = `type_${slug}`;
        const cachedType = await this.cacheManager.get(cacheKey);
        if (cachedType) {
            return cachedType;
        }
        const type = await this.typeRepository.createQueryBuilder('type')
            .leftJoinAndSelect('type.settings', 'settings')
            .leftJoinAndSelect('type.promotional_sliders', 'promotional_sliders')
            .leftJoinAndSelect('type.banners', 'banners')
            .leftJoinAndSelect('banners.image', 'banner_image')
            .leftJoinAndSelect('type.products', 'products')
            .where('type.slug = :slug', { slug })
            .getOne();
        if (!type) {
            throw new common_1.NotFoundException(`Type with slug ${slug} not found`);
        }
        await this.cacheManager.set(cacheKey, type, 300);
        return type;
    }
    async create(data) {
        const typeSettings = this.typeSettingsRepository.create(data.settings);
        await this.typeSettingsRepository.save(typeSettings);
        let promotionalSliders = [];
        if (data.promotional_sliders && Array.isArray(data.promotional_sliders)) {
            promotionalSliders = await this.attachmentRepository.findByIds(data.promotional_sliders.map(slider => slider.id));
        }
        let banners = [];
        if (data.banners && Array.isArray(data.banners)) {
            banners = await Promise.all(data.banners.map(async (bannerData) => {
                const image = await this.attachmentRepository.findOne({
                    where: { id: bannerData.image.id, thumbnail: bannerData.image.thumbnail, original: bannerData.image.original }
                });
                const banner = this.bannerRepository.create({
                    title: bannerData.title,
                    description: bannerData.description,
                    image,
                });
                return this.bannerRepository.save(banner);
            }));
        }
        if (data.name) {
            data.slug = await this.convertToSlug(data.name);
        }
        const shop = await this.shopRepository.findOne({ where: { id: data.shop_id } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${data.shop_id} not found`);
        }
        const regions = await this.regionRepository.find({
            where: {
                name: (0, typeorm_2.In)(data.region_name),
            },
        });
        if (regions.length !== data.region_name.length) {
            const missingRegionNames = data.region_name.filter((name) => !regions.some((region) => region.name === name));
            throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
        }
        const type = this.typeRepository.create(Object.assign(Object.assign({}, data), { settings: typeSettings, promotional_sliders: promotionalSliders, banners,
            shop,
            regions }));
        return this.typeRepository.save(type);
    }
    async update(id, updateTypeDto) {
        const type = await this.typeRepository.findOne({
            where: { id },
            relations: ['settings', 'promotional_sliders', 'banners', 'banners.image', 'regions'],
        });
        if (!type) {
            throw new common_1.NotFoundException(`Type with ID ${id} not found`);
        }
        if (updateTypeDto.settings) {
            type.settings = this.typeSettingsRepository.merge(type.settings, updateTypeDto.settings);
            await this.typeSettingsRepository.save(type.settings);
        }
        if (updateTypeDto.promotional_sliders) {
            const sliderIds = updateTypeDto.promotional_sliders.map(slider => slider.id);
            const sliders = await this.attachmentRepository.findByIds(sliderIds);
            type.promotional_sliders = sliders;
        }
        if (updateTypeDto.banners) {
            type.banners = await Promise.all(updateTypeDto.banners.map(async (bannerData) => {
                let banner = await this.bannerRepository.findOne({ where: { id: bannerData.id } });
                if (!banner) {
                    banner = this.bannerRepository.create();
                }
                banner.title = bannerData.title;
                banner.description = bannerData.description;
                if (bannerData.image && bannerData.image.id) {
                    let image = await this.attachmentRepository.findOne({ where: { id: bannerData.image.id } });
                    if (!image) {
                        image = this.attachmentRepository.create(bannerData.image);
                        image = await this.attachmentRepository.save(image);
                    }
                    banner.image = image;
                }
                return this.bannerRepository.save(banner);
            }));
        }
        if (updateTypeDto.region_name) {
            const regions = await this.regionRepository.find({
                where: {
                    name: (0, typeorm_2.In)(updateTypeDto.region_name),
                },
            });
            if (regions.length !== updateTypeDto.region_name.length) {
                const missingRegionNames = updateTypeDto.region_name.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            type.regions = regions;
        }
        if (updateTypeDto.name) {
            type.name = updateTypeDto.name;
        }
        if (updateTypeDto.icon) {
            type.icon = updateTypeDto.icon;
        }
        if (updateTypeDto.language) {
            type.language = updateTypeDto.language;
        }
        if (updateTypeDto.translated_languages) {
            type.translated_languages = updateTypeDto.translated_languages;
        }
        return this.typeRepository.save(type);
    }
    async remove(id) {
        const type = await this.typeRepository.findOne({
            where: { id },
            relations: ['settings', 'promotional_sliders', 'banners', 'banners.image', 'categories', 'tags', 'products'],
        });
        if (!type) {
            throw new Error(`Type with ID ${id} not found`);
        }
        if (type.banners) {
            for (const banner of type.banners) {
                if (banner.image) {
                    const imageId = banner.image.id;
                    banner.image = null;
                    await this.bannerRepository.save(banner);
                    await this.attachmentRepository.delete(imageId);
                }
            }
            const bannerIds = type.banners.map(banner => banner.id);
            if (bannerIds.length > 0) {
                await this.bannerRepository.delete(bannerIds);
            }
        }
        if (type.promotional_sliders) {
            const promotionalSliderIds = type.promotional_sliders.map(slider => slider.id);
            if (promotionalSliderIds.length > 0) {
                type.promotional_sliders = [];
                await this.typeRepository.save(type);
                await this.typeRepository
                    .createQueryBuilder()
                    .delete()
                    .from("type_promotional_sliders")
                    .where("attachmentId IN (:...ids)", { ids: promotionalSliderIds })
                    .execute();
                await this.attachmentRepository
                    .createQueryBuilder()
                    .delete()
                    .from(attachment_entity_1.Attachment)
                    .where("id IN (:...ids)", { ids: promotionalSliderIds })
                    .execute();
            }
        }
        if (type.settings) {
            await this.typeSettingsRepository.delete(type.settings.id);
            type.settings = null;
            await this.typeRepository.save(type);
        }
        if (type.categories && type.categories.length > 0) {
            await Promise.all(type.categories.map(category => {
                category.type = null;
                return this.categoryRepository.save(category);
            }));
        }
        if (type.tags && type.tags.length > 0) {
            await this.tagRepository.remove(type.tags);
        }
        if (type.products && type.products.length > 0) {
            await Promise.all(type.products.map(product => {
                product.type = null;
                return this.productRepository.save(product);
            }));
        }
        await this.typeRepository.remove(type);
    }
};
TypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(type_entity_1.Type)),
    __param(2, (0, typeorm_1.InjectRepository)(type_entity_1.TypeSettings)),
    __param(3, (0, typeorm_1.InjectRepository)(type_entity_1.Banner)),
    __param(4, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(5, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(6, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(7, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(8, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(9, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(10, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], TypesService);
exports.TypesService = TypesService;
//# sourceMappingURL=types.service.js.map
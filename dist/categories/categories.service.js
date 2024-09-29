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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const category_entity_1 = require("./entities/category.entity");
const paginate_1 = require("../common/pagination/paginate");
const typeorm_1 = require("@nestjs/typeorm");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const helpers_1 = require("../helpers");
const typeorm_2 = require("typeorm");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
const type_entity_1 = require("../types/entities/type.entity");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository, attachmentRepository, typeRepository, shopRepository, subCategoryRepository, regionRepository, cacheManager) {
        this.categoryRepository = categoryRepository;
        this.attachmentRepository = attachmentRepository;
        this.typeRepository = typeRepository;
        this.shopRepository = shopRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.regionRepository = regionRepository;
        this.cacheManager = cacheManager;
    }
    async convertToSlug(text) {
        return await (0, helpers_1.convertToSlug)(text);
    }
    async create(createCategoryDto) {
        var _a, _b;
        let imageAttachment;
        if ((_a = createCategoryDto.image) === null || _a === void 0 ? void 0 : _a.id) {
            imageAttachment = await this.attachmentRepository.findOne({ where: { id: createCategoryDto.image.id } });
            if (!imageAttachment) {
                throw new Error(`Attachment with id '${(_b = createCategoryDto.image) === null || _b === void 0 ? void 0 : _b.id}' not found`);
            }
        }
        const type = await this.typeRepository.findOne({ where: { id: createCategoryDto.type_id } });
        if (!type) {
            throw new Error(`Type with id '${createCategoryDto.type_id}' not found`);
        }
        const category = new category_entity_1.Category();
        if (createCategoryDto.region_name && createCategoryDto.region_name.length > 0) {
            const regions = await this.regionRepository.find({
                where: {
                    name: (0, typeorm_2.In)(createCategoryDto.region_name),
                },
            });
            if (regions.length !== createCategoryDto.region_name.length) {
                const missingRegionNames = createCategoryDto.region_name.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            category.regions = regions;
        }
        category.name = createCategoryDto.name;
        category.slug = await this.convertToSlug(createCategoryDto.name);
        category.type = type;
        category.details = createCategoryDto.details;
        category.parent = null;
        category.image = imageAttachment;
        category.icon = createCategoryDto.icon;
        category.language = createCategoryDto.language;
        const shop = await this.shopRepository.findOne({ where: { id: createCategoryDto.shop_id } });
        if (shop) {
            category.shop = shop;
        }
        else {
            throw new common_1.NotFoundException(`Shop with id '${createCategoryDto.shop_id}' not found`);
        }
        return await this.categoryRepository.save(category);
    }
    async getCategories(query) {
        const { limit = '10', page = '1', search, parent, shopSlug, shopId, language, orderBy = '', sortedBy = 'DESC', region_name, } = query;
        const numericPage = Number(page);
        const numericLimit = Number(limit);
        if (isNaN(numericPage) || isNaN(numericLimit)) {
            throw new common_1.BadRequestException('Page and limit values must be numbers');
        }
        const skip = (numericPage - 1) * numericLimit;
        const cacheKey = `categories-${numericPage}-${numericLimit}-${search || 'all'}-${parent || 'all'}-${shopSlug || 'all'}-${shopId || 'all'}-${language || 'all'}-${orderBy || 'none'}-${sortedBy || 'none'}-${region_name || 'all'}`;
        let categories = await this.cacheManager.get(cacheKey);
        if (!categories) {
            const where = {};
            if (search) {
                where.name = (0, typeorm_2.Like)(`%${search}%`);
            }
            if (shopSlug) {
                const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
                if (!shop) {
                    throw new common_1.NotFoundException('Shop not found');
                }
                where.shop = { id: shop.id };
            }
            if (shopId) {
                where.shop = { id: shopId };
            }
            if (parent && parent !== 'null') {
                where.parent = { id: parent };
            }
            else if (parent === 'null') {
                where.parent = (0, typeorm_2.IsNull)();
            }
            if (language) {
                where.language = language;
            }
            if (region_name) {
                const region = await this.regionRepository.findOne({
                    where: { name: region_name },
                    relations: ['categories'],
                });
                if (!region) {
                    throw new common_1.NotFoundException('Region not found');
                }
                where.regions = { id: region.id };
            }
            const order = orderBy && sortedBy ? { [orderBy]: sortedBy.toUpperCase() } : {};
            const [data, total] = await this.categoryRepository.findAndCount({
                where,
                take: numericLimit,
                skip,
                relations: ['type', 'image', 'subCategories', 'shop', 'regions'],
                order,
            });
            const url = `/categories?search=${search}&limit=${numericLimit}&parent=${parent}&shopSlug=${shopSlug}&shopId=${shopId}&language=${language}&region_name=${region_name}`;
            categories = Object.assign({ data }, (0, paginate_1.paginate)(total, numericPage, numericLimit, data.length, url));
            await this.cacheManager.set(cacheKey, categories, 60);
        }
        return categories;
    }
    async getCategory(param, language, shopId) {
        const cacheKey = `category-${param}-${language}-${shopId}`;
        let category = await this.cacheManager.get(cacheKey);
        if (!category) {
            const id = Number(param);
            if (!isNaN(id)) {
                category = await this.categoryRepository.findOne({
                    where: { id: id, language: language, shop: { id: shopId } },
                    relations: ['type', 'image', 'shop'],
                });
            }
            else {
                category = await this.categoryRepository.findOne({
                    where: { slug: param, language: language, shop: { id: shopId } },
                    relations: ['type', 'image', 'shop'],
                });
            }
            if (!category) {
                throw new common_1.NotFoundException('Category not found');
            }
            await this.cacheManager.set(cacheKey, category, 60);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['type', 'image', 'regions', 'shop', 'parent'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (updateCategoryDto.image) {
            const image = await this.attachmentRepository.findOne({ where: { id: updateCategoryDto.image.id } });
            if (!image) {
                throw new common_1.NotFoundException(`Image with ID '${updateCategoryDto.image.id}' not found`);
            }
            if (category.image && (await this.categoryRepository.count({ where: { image: category.image } })) === 1) {
                await this.attachmentRepository.remove(category.image);
            }
            category.image = image;
        }
        if (updateCategoryDto.type_id) {
            const type = await this.typeRepository.findOne({ where: { id: updateCategoryDto.type_id } });
            if (!type) {
                throw new common_1.NotFoundException(`Type with ID '${updateCategoryDto.type_id}' not found`);
            }
            category.type = type;
        }
        if (updateCategoryDto.parent) {
            const parentCategory = await this.categoryRepository.findOne({ where: { id: updateCategoryDto.parent.id } });
            if (!parentCategory) {
                throw new common_1.NotFoundException(`Parent category with ID '${updateCategoryDto.parent}' not found`);
            }
            category.parent = parentCategory;
        }
        else {
            category.parent = null;
        }
        if (updateCategoryDto.region_name && updateCategoryDto.region_name.length > 0) {
            const regions = await this.regionRepository.find({
                where: { name: (0, typeorm_2.In)(updateCategoryDto.region_name) },
            });
            if (regions.length !== updateCategoryDto.region_name.length) {
                const missingRegionNames = updateCategoryDto.region_name.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            category.regions = regions;
        }
        category.name = updateCategoryDto.name || category.name;
        category.slug = updateCategoryDto.name ? await this.convertToSlug(updateCategoryDto.name) : category.slug;
        category.details = updateCategoryDto.details || category.details;
        category.icon = updateCategoryDto.icon || category.icon;
        category.language = updateCategoryDto.language || category.language;
        if (updateCategoryDto.shop_id) {
            const shop = await this.shopRepository.findOne({ where: { id: updateCategoryDto.shop_id } });
            if (shop) {
                category.shop = shop;
            }
            else {
                throw new common_1.NotFoundException(`Shop with id '${updateCategoryDto.shop_id}' not found`);
            }
        }
        return this.categoryRepository.save(category);
    }
    async remove(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['image', 'subCategories'],
        });
        if (!category) {
            throw new Error('Category not found');
        }
        if (category.subCategories && category.subCategories.length > 0) {
            for (const subCategory of category.subCategories) {
                subCategory.category = null;
                await this.subCategoryRepository.save(subCategory);
            }
        }
        if (category.image) {
            const image = category.image;
            category.image = null;
            await this.categoryRepository.save(category);
            await this.attachmentRepository.remove(image);
        }
        await this.categoryRepository.remove(category);
    }
    async createSubCategory(createSubCategoryDto) {
        var _a;
        let imageAttachment;
        if ((_a = createSubCategoryDto.image) === null || _a === void 0 ? void 0 : _a.id) {
            imageAttachment = await this.attachmentRepository.findOne({ where: { id: createSubCategoryDto.image.id } });
            if (!imageAttachment) {
                throw new Error(`Attachment with id '${createSubCategoryDto.image.id}' not found`);
            }
        }
        const category = await this.categoryRepository.findOne({ where: { id: createSubCategoryDto.category_id } });
        if (!category) {
            throw new Error(`Category with id '${createSubCategoryDto.category_id}' not found`);
        }
        const shop = await this.shopRepository.findOne({ where: { id: createSubCategoryDto.shop_id } });
        if (!shop) {
            throw new Error(`Shop with id '${createSubCategoryDto.shop_id}' not found`);
        }
        const subCategory = new category_entity_1.SubCategory();
        if (createSubCategoryDto.regionName && createSubCategoryDto.regionName.length > 0) {
            const regions = await this.regionRepository.find({
                where: {
                    name: (0, typeorm_2.In)(createSubCategoryDto.regionName),
                },
            });
            if (regions.length !== createSubCategoryDto.regionName.length) {
                const missingRegionNames = createSubCategoryDto.regionName.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            subCategory.regions = regions;
        }
        subCategory.name = createSubCategoryDto.name;
        subCategory.slug = await this.convertToSlug(createSubCategoryDto.name);
        subCategory.category = category;
        subCategory.details = createSubCategoryDto.details;
        subCategory.image = imageAttachment;
        subCategory.language = createSubCategoryDto.language;
        subCategory.shop = shop;
        return await this.subCategoryRepository.save(subCategory);
    }
    async getSubCategory(param, language, shopSlug) {
        const id = Number(param);
        if (!isNaN(id)) {
            return this.subCategoryRepository.findOne({
                where: { id: id, shop: { slug: shopSlug } },
                relations: ['image', 'shop', 'category'],
            });
        }
        else {
            return this.subCategoryRepository.findOne({
                where: { slug: param, language: language, shop: { slug: shopSlug } },
                relations: ['shop', 'image', 'category'],
            });
        }
    }
    async getSubCategories(query) {
        const { limit = '10', page = '1', search, categoryId, shopSlug, regionName, orderBy = '', sortedBy = 'DESC', } = query;
        const numericPage = Number(page);
        const numericLimit = Number(limit);
        if (isNaN(numericPage) || isNaN(numericLimit)) {
            throw new common_1.BadRequestException('Page and limit values must be numbers');
        }
        const skip = (numericPage - 1) * numericLimit;
        const cacheKey = `subcategories-${numericPage}-${numericLimit}-${search || 'all'}-${categoryId || 'all'}-${shopSlug || 'all'}-${regionName || 'all'}-${orderBy || 'none'}-${sortedBy || 'none'}`;
        let subCategories = await this.cacheManager.get(cacheKey);
        if (!subCategories) {
            const where = {};
            if (search) {
                where.name = (0, typeorm_2.Like)(`%${search}%`);
            }
            if (categoryId) {
                where.category = { id: categoryId };
            }
            if (shopSlug) {
                const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
                if (!shop) {
                    throw new common_1.NotFoundException('Shop not found');
                }
                where.shop = { id: shop.id };
            }
            if (regionName) {
                const region = await this.regionRepository.findOne({
                    where: { name: regionName },
                    relations: ['categories'],
                });
                if (!region) {
                    throw new common_1.NotFoundException('Region not found');
                }
                where.regions = { id: region.id };
            }
            const order = orderBy && sortedBy ? { [orderBy]: sortedBy.toUpperCase() } : {};
            const [data, total] = await this.subCategoryRepository.findAndCount({
                where,
                take: numericLimit,
                skip,
                relations: ['category', 'image', 'shop', 'regions'],
                order,
            });
            const url = `/subcategories?search=${search}&limit=${numericLimit}&categoryId=${categoryId}&shopSlug=${shopSlug}&regionName=${regionName}`;
            subCategories = Object.assign({ data }, (0, paginate_1.paginate)(total, numericPage, numericLimit, data.length, url));
            await this.cacheManager.set(cacheKey, subCategories, 60);
        }
        return subCategories;
    }
    async updateSubCategory(id, updateSubCategoryDto) {
        const subCategory = await this.subCategoryRepository.findOne({
            where: { id },
            relations: ['category', 'image', 'shop', 'regions'],
        });
        if (!subCategory) {
            throw new common_1.NotFoundException('SubCategory not found');
        }
        if (updateSubCategoryDto.image) {
            const image = await this.attachmentRepository.findOne({ where: { id: updateSubCategoryDto.image.id } });
            if (!image) {
                throw new common_1.NotFoundException(`Image with ID '${updateSubCategoryDto.image.id}' not found`);
            }
            if (subCategory.image && (await this.subCategoryRepository.count({ where: { image: subCategory.image } })) === 1) {
                await this.attachmentRepository.remove(subCategory.image);
            }
            subCategory.image = image;
        }
        if (updateSubCategoryDto.category_id) {
            const category = await this.categoryRepository.findOne({ where: { id: updateSubCategoryDto.category_id } });
            if (!category) {
                throw new common_1.NotFoundException(`subCategory with ID '${updateSubCategoryDto.category_id}' not found`);
            }
            subCategory.category = category;
        }
        if (updateSubCategoryDto.regionName && updateSubCategoryDto.regionName.length > 0) {
            const regions = await this.regionRepository.find({
                where: {
                    name: (0, typeorm_2.In)(updateSubCategoryDto.regionName),
                },
            });
            if (regions.length !== updateSubCategoryDto.regionName.length) {
                const missingRegionNames = updateSubCategoryDto.regionName.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            subCategory.regions = regions;
        }
        if (updateSubCategoryDto.name) {
            subCategory.name = updateSubCategoryDto.name;
            subCategory.slug = await this.convertToSlug(updateSubCategoryDto.name);
        }
        if (updateSubCategoryDto.details) {
            subCategory.details = updateSubCategoryDto.details;
        }
        if (updateSubCategoryDto.language) {
            subCategory.language = updateSubCategoryDto.language;
        }
        return this.subCategoryRepository.save(subCategory);
    }
    async removeSubCategory(id) {
        const subCategory = await this.subCategoryRepository.findOne({
            where: { id },
            relations: ['image'],
        });
        if (!subCategory) {
            throw new Error('SubCategory not found');
        }
        if (subCategory.image) {
            const image = subCategory.image;
            subCategory.image = null;
            await this.subCategoryRepository.save(subCategory);
            await this.attachmentRepository.remove(image);
        }
        await this.subCategoryRepository.remove(subCategory);
    }
};
CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(1, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(2, (0, typeorm_1.InjectRepository)(type_entity_1.Type)),
    __param(3, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(4, (0, typeorm_1.InjectRepository)(category_entity_1.SubCategory)),
    __param(5, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(6, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], CategoriesService);
exports.CategoriesService = CategoriesService;
//# sourceMappingURL=categories.service.js.map
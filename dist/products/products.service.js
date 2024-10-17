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
var ProductsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const product_entity_1 = require("./entities/product.entity");
const paginate_1 = require("../common/pagination/paginate");
const typeorm_1 = require("@nestjs/typeorm");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const type_entity_1 = require("../types/entities/type.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const attribute_value_entity_1 = require("../attributes/entities/attribute-value.entity");
const dealer_entity_1 = require("../users/entities/dealer.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_2 = require("typeorm");
const tax_entity_1 = require("../taxes/entities/tax.entity");
const schedule_1 = require("@nestjs/schedule");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
const helpers_1 = require("../helpers");
let ProductsService = ProductsService_1 = class ProductsService {
    constructor(productRepository, orderProductPivotRepository, variationRepository, variationOptionRepository, attachmentRepository, tagRepository, typeRepository, shopRepository, categoryRepository, subCategoryRepository, attributeValueRepository, dealerRepository, dealerProductMarginRepository, dealerCategoryMarginRepository, userRepository, taxRepository, regionRepository, cacheManager) {
        this.productRepository = productRepository;
        this.orderProductPivotRepository = orderProductPivotRepository;
        this.variationRepository = variationRepository;
        this.variationOptionRepository = variationOptionRepository;
        this.attachmentRepository = attachmentRepository;
        this.tagRepository = tagRepository;
        this.typeRepository = typeRepository;
        this.shopRepository = shopRepository;
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
        this.attributeValueRepository = attributeValueRepository;
        this.dealerRepository = dealerRepository;
        this.dealerProductMarginRepository = dealerProductMarginRepository;
        this.dealerCategoryMarginRepository = dealerCategoryMarginRepository;
        this.userRepository = userRepository;
        this.taxRepository = taxRepository;
        this.regionRepository = regionRepository;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(ProductsService_1.name);
    }
    async onModuleInit() {
        this.logger.debug('ProductService initialized');
        await this.updateProductStockStatus();
    }
    async updateProductStockStatus() {
        try {
            this.logger.debug('Updating product stock status...');
            await this.productRepository.query(`
      UPDATE product
      SET in_stock = CASE
        WHEN quantity > 0 THEN true
        ELSE false
      END
    `);
            this.logger.debug('Product stock status updated successfully');
        }
        catch (err) {
            this.logger.error('Error updating product stock status:', err.message || err);
        }
    }
    getValueFromSearch(searchString, key) {
        const regex = new RegExp(`${key}:(\\d+)`);
        const match = searchString.match(regex);
        return match ? match[1] : null;
    }
    async updateShopProductsCount(shopId, productId) {
        try {
            console.log("115", shopId);
            console.log("116", productId);
            const shop = await this.shopRepository.findOne({ where: { id: shopId } });
            if (!shop) {
                throw new common_1.NotFoundException(`Shop with ID ${shopId} not found`);
            }
            const productExists = await this.productRepository.findOne({ where: { id: productId } });
            shop.products_count = productExists ? shop.products_count + 1 : Math.max(0, shop.products_count - 1);
            console.log("128");
            await this.shopRepository.save(shop);
            console.log("131");
        }
        catch (err) {
            this.logger.error('Error updating shop products count:', err.message || err);
            throw new common_1.BadRequestException('Error updating shop products count');
        }
    }
    async create(createProductDto) {
        const { name, slug, description, product_type, status, quantity, max_price, min_price, price, sale_price, unit, height, length, width, sku, language = 'en', translated_languages = ['en'], taxes, type_id, shop_id, categories, subCategories, tags, image, gallery, variations, variation_options, regionName, } = createProductDto;
        const existedProduct = await this.productRepository.findOne({
            where: { name, slug },
        });
        if (existedProduct) {
            return { message: 'Product already exists.' };
        }
        const product = this.productRepository.create({
            name,
            slug: (0, helpers_1.convertToSlug)(name),
            description,
            product_type,
            status,
            quantity,
            max_price: max_price || price,
            min_price: min_price || sale_price,
            price: max_price || price,
            sale_price: min_price || sale_price,
            unit,
            height,
            length,
            width,
            sku,
            language,
            translated_languages,
        });
        if (taxes) {
            const tax = await this.taxRepository.findOne({ where: { id: taxes.id } });
            if (tax) {
                product.taxes = tax;
            }
            else {
                throw new common_1.NotFoundException(`Tax with ID ${taxes.id} not found`);
            }
        }
        if (type_id) {
            const type = await this.typeRepository.findOne({ where: { id: type_id } });
            if (!type) {
                throw new common_1.NotFoundException(`Type with ID ${type_id} not found`);
            }
            product.type = type;
            product.type_id = type.id;
        }
        const shop = await this.shopRepository.findOne({ where: { id: shop_id } });
        if (!shop) {
            throw new common_1.NotFoundException(`Shop with ID ${shop_id} not found`);
        }
        product.shop = shop;
        product.shop_id = shop.id;
        const categoryEntities = categories
            ? await this.categoryRepository.findByIds(categories)
            : [];
        const subCategoryEntities = subCategories
            ? await this.subCategoryRepository.findByIds(subCategories)
            : [];
        product.categories = categoryEntities;
        product.subCategories = subCategoryEntities;
        product.tags = await this.tagRepository.findByIds(tags || []);
        if (image) {
            const imageEntity = await this.attachmentRepository.findOne({
                where: { id: image.id },
            });
            if (!imageEntity) {
                throw new common_1.NotFoundException(`Image with ID ${image.id} not found`);
            }
            product.image = imageEntity;
        }
        if (gallery) {
            const galleryEntities = await Promise.all(gallery.map(async (galleryImage) => {
                const imageEntity = await this.attachmentRepository.findOne({
                    where: { id: galleryImage.id },
                });
                if (!imageEntity) {
                    throw new common_1.NotFoundException(`Gallery image with ID ${galleryImage.id} not found`);
                }
                return imageEntity;
            }));
            product.gallery = galleryEntities;
        }
        if (variations) {
            product.variations = await Promise.all(variations.map(async (variation) => {
                const attributeValue = await this.attributeValueRepository.findOne({
                    where: { id: variation.attribute_value_id },
                });
                if (!attributeValue) {
                    throw new common_1.NotFoundException(`Attribute value with ID ${variation.attribute_value_id} not found`);
                }
                return attributeValue;
            }));
        }
        if (product.product_type === product_entity_1.ProductType.VARIABLE &&
            (variation_options === null || variation_options === void 0 ? void 0 : variation_options.upsert)) {
            const variationOptions = await Promise.all(variation_options.upsert.map(async (variationDto) => {
                const newVariation = this.variationRepository.create({
                    title: variationDto.title,
                    name: variationDto.name,
                    slug: (0, helpers_1.convertToSlug)(variationDto.name),
                    price: variationDto.price,
                    sku: variationDto.sku,
                    is_disable: variationDto.is_disable,
                    sale_price: variationDto.sale_price,
                    quantity: variationDto.quantity,
                });
                const savedVariation = await this.variationRepository.save(newVariation);
                if (variationDto === null || variationDto === void 0 ? void 0 : variationDto.image) {
                    let image = await this.attachmentRepository.findOne({
                        where: { id: variationDto.image.id },
                    });
                    if (!image) {
                        image = this.attachmentRepository.create({
                            original: variationDto.image.original,
                            thumbnail: variationDto.image.thumbnail,
                        });
                        await this.attachmentRepository.save(image);
                    }
                    savedVariation.image = [image];
                }
                const variationOptionEntities = await Promise.all((variationDto.options || []).map(async (option) => {
                    const values = option.value.split(',');
                    return Promise.all(values.map(async (value) => {
                        const newVariationOption = this.variationOptionRepository.create({
                            name: option.name,
                            value: value.trim(),
                        });
                        return this.variationOptionRepository.save(newVariationOption);
                    }));
                }));
                savedVariation.options = [].concat(...variationOptionEntities);
                await this.variationRepository.save(savedVariation);
                return savedVariation;
            }));
            product.variation_options = variationOptions;
        }
        if (regionName) {
            const regions = await this.regionRepository.find({
                where: { name: (0, typeorm_2.In)(regionName) },
            });
            if (regions.length !== regionName.length) {
                const missingRegionNames = regionName.filter((name) => !regions.some((region) => region.name === name));
                throw new common_1.NotFoundException(`Regions with names '${missingRegionNames.join(', ')}' not found`);
            }
            product.regions = regions;
        }
        await this.productRepository.save(product);
        await this.updateShopProductsCount(shop.id, product.id);
        return product;
    }
    async getProducts(query) {
        const { limit = 20, page = 1, search, filter, dealerId, shop_id, shopName, regionNames, minPrice, maxPrice, } = query;
        const startIndex = (page - 1) * limit;
        if (!shop_id && !shopName && !dealerId) {
            return {
                data: [],
                count: 0,
                current_page: 1,
                firstItem: null,
                lastItem: null,
                last_page: 1,
                per_page: 10,
                total: 0,
                first_page_url: '',
                last_page_url: '',
                next_page_url: '',
                prev_page_url: '',
            };
        }
        const regionsArray = Array.isArray(regionNames)
            ? regionNames
            : typeof regionNames === 'string' && regionNames.length > 0
                ? regionNames.split(',')
                : [];
        const cacheKey = `products:${shop_id || ' '}:${shopName || ' '}:${dealerId || ' '}:${filter || ' '}:${search || ' '}:${regionsArray.join(',')}:${page}:${limit}`;
        const cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            this.logger.log(`Cache hit for key: ${cacheKey}`);
            return cachedResult;
        }
        const productQueryBuilder = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.type', 'type')
            .leftJoinAndSelect('product.shop', 'shop')
            .leftJoinAndSelect('product.image', 'image')
            .leftJoinAndSelect('product.categories', 'categories')
            .leftJoinAndSelect('product.subCategories', 'subCategories')
            .leftJoinAndSelect('product.tags', 'tags')
            .leftJoinAndSelect('product.related_products', 'related_products')
            .leftJoinAndSelect('product.variations', 'variations')
            .leftJoinAndSelect('product.variation_options', 'variation_options')
            .leftJoinAndSelect('product.gallery', 'gallery')
            .leftJoinAndSelect('product.my_review', 'my_review')
            .leftJoinAndSelect('product.regions', 'regions');
        if (shop_id) {
            productQueryBuilder.andWhere('shop.id = :shop_id', { shop_id });
        }
        else if (shopName) {
            productQueryBuilder.andWhere('(shop.name = :shopName OR shop.slug = :shopName)', { shopName });
        }
        else if (dealerId) {
            productQueryBuilder.andWhere('product.dealerId = :dealerId', { dealerId });
        }
        if (regionsArray.length > 0) {
            productQueryBuilder.andWhere('regions.name IN (:...regionsArray)', {
                regionsArray,
            });
        }
        if (minPrice !== undefined) {
            productQueryBuilder.andWhere('product.price >= :minPrice', { minPrice });
        }
        if (maxPrice !== undefined) {
            productQueryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
        }
        if (search || filter) {
            const searchConditions = [];
            const searchParams = {};
            if (filter && typeof filter === 'string') {
                const parseSearchParams = filter.split(';');
                parseSearchParams.forEach((searchParam) => {
                    const [key, value] = searchParam.split(':');
                    const searchTerm = `%${value}%`;
                    switch (key) {
                        case 'product':
                            searchConditions.push('(product.name LIKE :productSearchTerm OR product.slug LIKE :productSearchTerm)');
                            searchParams.productSearchTerm = searchTerm;
                            break;
                        case 'category':
                            searchConditions.push('(categories.name LIKE :categorySearchTerm OR categories.slug LIKE :categorySearchTerm)');
                            searchParams.categorySearchTerm = searchTerm;
                            break;
                        case 'subCategories':
                            searchConditions.push('(subCategories.name LIKE :subCategorySearchTerm OR subCategories.slug LIKE :subCategorySearchTerm)');
                            searchParams.subCategorySearchTerm = searchTerm;
                            break;
                        case 'tags':
                            const tagsArray = value.split(',');
                            searchConditions.push('tags.name IN (:...tagsArray)');
                            searchParams.tagsArray = tagsArray;
                            break;
                        case 'variations':
                            const variationParams = value.split(',');
                            const variationSearchTerm = variationParams.map(param => param.split('=')[1]).join('/');
                            searchConditions.push('(variation_options.title LIKE :variationSearchTerm)');
                            searchParams.variationSearchTerm = `%${variationSearchTerm}%`;
                            break;
                        default:
                            break;
                    }
                });
            }
            if (search) {
                const searchTerms = search.split(' ').map((term) => `%${term}%`);
                searchTerms.forEach((term, index) => {
                    searchParams[`filterSearchTerm${index}`] = term;
                });
                const searchConditionsString = searchTerms
                    .map((_, index) => `product.name LIKE :filterSearchTerm${index} OR product.sku LIKE :filterSearchTerm${index}`)
                    .join(' OR ');
                searchConditions.push(searchConditionsString);
            }
            if (searchConditions.length > 0) {
                productQueryBuilder.andWhere(searchConditions.join(' AND '), searchParams);
            }
        }
        try {
            let products = [];
            let total;
            if (dealerId) {
                const dealer = await this.dealerRepository.findOne({
                    where: { id: dealerId },
                });
                if (!dealer) {
                    throw new common_1.NotFoundException(`Dealer not found with id: ${dealerId}`);
                }
                products = await this.fetchDealerProducts(dealerId);
                total = products.length;
            }
            else {
                total = await productQueryBuilder.getCount();
                productQueryBuilder.skip(startIndex).take(limit);
                products = await productQueryBuilder.cache(10000).getMany();
            }
            const url = `/products?limit=${limit}&page=${page}&shop_id=${shop_id || ''}&dealerId=${dealerId || ''}`;
            const paginator = (0, paginate_1.paginate)(total, page, limit, products.length, url);
            const result = Object.assign({ data: products }, paginator);
            await this.cacheManager.set(cacheKey, result, 1800);
            return result;
        }
        catch (error) {
            this.logger.error(`Error fetching products: ${error.message}`, error.stack);
            throw new common_1.NotFoundException(error.message);
        }
    }
    async fetchDealerProducts(dealerId) {
        const marginFind = await this.dealerProductMarginRepository.find({
            where: { dealer: { id: dealerId } },
            relations: ['product'],
        });
        return marginFind.map((margin) => margin.product);
    }
    async getProductBySlug(slug, shop_id, dealerId) {
        try {
            const cacheKey = `productBySlug:${shop_id}:${slug}:${dealerId || ' '}`;
            this.logger.log(`Generated cache key: ${cacheKey}`);
            const cachedResult = await this.cacheManager.get(cacheKey);
            if (cachedResult) {
                this.logger.log(`Cache hit for key: ${cacheKey}`);
                return cachedResult;
            }
            else {
                this.logger.log(`Cache miss for key: ${cacheKey}`);
            }
            const product = await this.productRepository.createQueryBuilder('product')
                .leftJoinAndSelect('product.type', 'type')
                .leftJoinAndSelect('product.shop', 'shop')
                .leftJoinAndSelect('product.image', 'image')
                .leftJoinAndSelect('product.categories', 'categories')
                .leftJoinAndSelect('product.subCategories', 'subCategories')
                .leftJoinAndSelect('product.tags', 'tags')
                .leftJoinAndSelect('product.related_products', 'related_products')
                .leftJoinAndSelect('related_products.image', 'related_product_image')
                .leftJoinAndSelect('related_products.gallery', 'related_product_gallery')
                .leftJoinAndSelect('product.variations', 'variations')
                .leftJoinAndSelect('variations.attribute', 'attribute')
                .leftJoinAndSelect('product.variation_options', 'variation_options')
                .leftJoinAndSelect('product.gallery', 'gallery')
                .leftJoinAndSelect('product.my_review', 'my_review')
                .leftJoinAndSelect('product.regions', 'regions')
                .where('product.slug = :slug', { slug })
                .andWhere('product.shop_id = :shop_id', { shop_id })
                .cache(20000)
                .getOne();
            if (!product) {
                throw new common_1.NotFoundException(`Product not found with slug: ${slug}`);
            }
            if (dealerId) {
                const dealerProductMargins = await this.dealerProductMarginRepository.createQueryBuilder('margin')
                    .leftJoinAndSelect('margin.product', 'productMargin')
                    .where('margin.dealerId = :dealerId', { dealerId })
                    .andWhere('productMargin.id = :productId', { productId: product.id })
                    .getOne();
                if (dealerProductMargins) {
                    product.margin = dealerProductMargins.margin;
                }
                else {
                    const categoryMargins = await this.dealerCategoryMarginRepository.createQueryBuilder('categoryMargin')
                        .leftJoin('categoryMargin.category', 'category')
                        .where('categoryMargin.dealerId = :dealerId', { dealerId })
                        .andWhere('category.id IN (:...categoryIds)', { categoryIds: product.categories.map(c => c.id) })
                        .getMany();
                    const matchingMargin = categoryMargins.find(cm => product.categories.some(category => category.id === cm.category.id));
                    if (matchingMargin) {
                        product.margin = matchingMargin.margin;
                    }
                }
            }
            if (product.type) {
                const relatedProducts = await this.productRepository.createQueryBuilder('related_products')
                    .where('related_products.type_id = :type_id', { type_id: product.type.id })
                    .andWhere('related_products.id != :productId', { productId: product.id })
                    .limit(20)
                    .getMany();
                product.related_products = relatedProducts;
            }
            else {
                product.related_products = [];
            }
            await this.cacheManager.set(cacheKey, product, 60 * 30);
            this.logger.log(`Data cached with key: ${cacheKey}`);
            return product;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            else {
                this.logger.error(`Error fetching product by slug: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException('An error occurred while fetching the product.');
            }
        }
    }
    async getPopularProducts(query) {
        const { limit = 10, type_slug, search, shopName, shop_id } = query;
        const cacheKey = `popularProducts:${shop_id || ''}:${shopName || ''}:${type_slug || ''}:${limit}`;
        this.logger.log(`Generated cache key: ${cacheKey}`);
        const cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            this.logger.log(`Cache hit for key: ${cacheKey}`);
            return cachedResult;
        }
        else {
            this.logger.log(`Cache miss for key: ${cacheKey}`);
        }
        const productsQueryBuilder = this.productRepository.createQueryBuilder('product')
            .leftJoinAndSelect('product.type', 'type')
            .leftJoinAndSelect('product.shop', 'shop')
            .leftJoinAndSelect('product.image', 'image')
            .leftJoinAndSelect('product.categories', 'categories')
            .leftJoinAndSelect('product.subCategories', 'subCategories')
            .leftJoinAndSelect('product.tags', 'tags')
            .leftJoinAndSelect('product.related_products', 'related_products')
            .leftJoinAndSelect('product.variations', 'variations')
            .leftJoinAndSelect('product.variation_options', 'variation_options')
            .leftJoinAndSelect('product.gallery', 'gallery')
            .leftJoinAndSelect('product.my_review', 'my_review')
            .leftJoinAndSelect('product.regions', 'regions');
        if (type_slug) {
            productsQueryBuilder.innerJoin('product.type', 'type')
                .where('type.slug = :typeSlug', { typeSlug: type_slug });
        }
        if (shop_id) {
            productsQueryBuilder.andWhere('product.shop_id = :shop_id', { shop_id });
        }
        if (shopName) {
            productsQueryBuilder.innerJoin('product.shop', 'shop')
                .andWhere('(shop.name = :shopName OR shop.slug = :shopName)', { shopName });
        }
        if (search) {
            productsQueryBuilder.andWhere('product.name LIKE :search', { search: `%${search}%` });
        }
        const products = await productsQueryBuilder.limit(limit).getMany();
        await this.cacheManager.set(cacheKey, products, 60 * 30);
        this.logger.log(`Data cached with key: ${cacheKey}`);
        return products;
    }
    async update(id, updateProductDto) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: [
                'type',
                'shop',
                'categories',
                'subCategories',
                'tags',
                'image',
                'gallery',
                'variations',
                'variation_options',
                'pivot',
            ],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const updatedProduct = Object.assign({}, product);
        for (const key in updateProductDto) {
            if (updateProductDto.hasOwnProperty(key) &&
                updateProductDto[key] !== updatedProduct[key]) {
                updatedProduct[key] = updateProductDto[key];
            }
        }
        product.name = updateProductDto.name || product.name;
        product.slug = updateProductDto.name
            ? updateProductDto.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            : product.slug;
        product.description = updateProductDto.description || product.description;
        product.product_type = updateProductDto.product_type || product.product_type;
        product.status = updateProductDto.status || product.status;
        product.quantity = updateProductDto.quantity || product.quantity;
        product.max_price = updateProductDto.max_price || product.max_price;
        product.min_price = updateProductDto.min_price || product.min_price;
        product.unit = updateProductDto.unit || product.unit;
        product.language = updateProductDto.language || product.language;
        product.translated_languages =
            updateProductDto.translated_languages || product.translated_languages;
        product.height = updateProductDto.height;
        product.length = updateProductDto.length;
        product.width = updateProductDto.width;
        product.sku = updateProductDto.sku;
        if (updateProductDto.taxes) {
            const tax = await this.taxRepository.findOne({
                where: { id: updateProductDto.taxes.id },
            });
            if (tax) {
                product.taxes = updateProductDto.taxes;
            }
        }
        if (updateProductDto.type_id) {
            const type = await this.typeRepository.findOne({
                where: { id: updateProductDto.type_id },
            });
            product.type = type;
            product.type_id = type === null || type === void 0 ? void 0 : type.id;
        }
        if (updateProductDto.shop_id) {
            const shop = await this.shopRepository.findOne({
                where: { id: updateProductDto.shop_id },
            });
            product.shop = shop;
            product.shop_id = shop.id;
        }
        if (updateProductDto.categories) {
            const categories = await this.categoryRepository.findByIds(updateProductDto.categories);
            product.categories = categories;
        }
        if (updateProductDto.subCategories) {
            const subCategories = await this.subCategoryRepository.findByIds(updateProductDto.subCategories);
            product.subCategories = subCategories;
        }
        if (updateProductDto.tags) {
            const tags = await this.tagRepository.findByIds(updateProductDto.tags);
            product.tags = tags;
        }
        if (updateProductDto.image) {
            const existingImage = product.image ? product.image.id : null;
            const updatedImage = updateProductDto.image.id;
            if (existingImage && existingImage !== updatedImage) {
                const image = product.image;
                product.image = null;
                await this.productRepository.save(product);
                await this.attachmentRepository.remove(image);
            }
            if (!existingImage || existingImage !== updatedImage) {
                const image = await this.attachmentRepository.findOne({
                    where: { id: updatedImage },
                });
                product.image = image;
            }
        }
        if (updateProductDto.gallery) {
            const existingGalleryImages = product.gallery.map((galleryImage) => galleryImage.id);
            const updatedGalleryImages = updateProductDto.gallery.map((galleryImage) => galleryImage.id);
            const imagesToRemove = existingGalleryImages.filter((id) => !updatedGalleryImages.includes(id));
            for (const imageId of imagesToRemove) {
                const image = product.gallery.find((galleryImage) => galleryImage.id === imageId);
                product.gallery.splice(product.gallery.indexOf(image), 1);
                await this.attachmentRepository.remove(image);
            }
            const newGalleryImages = updateProductDto.gallery.filter((galleryImage) => !existingGalleryImages.includes(galleryImage.id));
            for (const newGalleryImage of newGalleryImages) {
                const image = await this.attachmentRepository.findOne({
                    where: { id: newGalleryImage.id },
                });
                product.gallery.push(image);
            }
        }
        if (updateProductDto.variations) {
            product.variations = Array.isArray(product.variations)
                ? product.variations
                : [];
            const existingVariations = product.variations.map((variation) => variation.attribute_value_id);
            const updateVariations = Array.isArray(updateProductDto.variations)
                ? updateProductDto.variations
                : [];
            const newVariations = updateVariations.filter((variation) => !existingVariations.includes(variation.attribute_value_id));
            for (const newVariation of newVariations) {
                const variation = await this.attributeValueRepository.findOne({
                    where: { id: newVariation.attribute_value_id },
                });
                if (variation) {
                    product.variations.push(variation);
                }
            }
            const variationsToRemove = existingVariations.filter((variation) => !updateVariations
                .map((v) => v.attribute_value_id)
                .includes(variation));
            for (const variationId of variationsToRemove) {
                const variationIndex = product.variations.findIndex((v) => v.attribute_value_id === variationId);
                if (variationIndex !== -1) {
                    product.variations.splice(variationIndex, 1);
                }
            }
        }
        if (updateProductDto.product_type === 'variable' &&
            updateProductDto.variation_options) {
            const existingVariations = product.variation_options.map((variation) => variation.id);
            const upsertVariations = Array.isArray(updateProductDto.variation_options.upsert)
                ? updateProductDto.variation_options.upsert
                : [];
            for (const upsertVariationDto of upsertVariations) {
                let variation;
                if (existingVariations.includes(upsertVariationDto.id)) {
                    variation = product.variation_options.find((variation) => variation.id === upsertVariationDto.id);
                }
                else {
                    variation = new product_entity_1.Variation();
                    product.variation_options.push(variation);
                }
                variation.title = upsertVariationDto.title;
                variation.price = upsertVariationDto.price;
                variation.sku = upsertVariationDto.sku;
                variation.is_disable = upsertVariationDto.is_disable;
                variation.sale_price = upsertVariationDto.sale_price;
                variation.quantity = upsertVariationDto.quantity;
                if (upsertVariationDto.image) {
                    let image = await this.attachmentRepository.findOne({
                        where: { id: upsertVariationDto.image.id },
                    });
                    if (!image) {
                        image = new attachment_entity_1.Attachment();
                        image.id = upsertVariationDto.image.id;
                        image.original = upsertVariationDto.image.original;
                        image.thumbnail = upsertVariationDto.image.thumbnail;
                        await this.attachmentRepository.save(image);
                    }
                    variation.image = image;
                }
                variation.options = Array.isArray(variation.options)
                    ? variation.options
                    : [];
                const existingOptionIds = variation.options.map((option) => option.id);
                const updatedOptionIds = upsertVariationDto.options.map((option) => option.id);
                const optionsToRemove = existingOptionIds.filter((id) => !updatedOptionIds.includes(id));
                for (const optionId of optionsToRemove) {
                    const option = variation.options.find((option) => option.id === optionId);
                    if (option) {
                        variation.options.splice(variation.options.indexOf(option), 1);
                        await this.variationOptionRepository.remove(option);
                    }
                }
                const newOptions = upsertVariationDto.options.filter((option) => !existingOptionIds.includes(option.id));
                for (const newOptionDto of newOptions) {
                    const newOption = new product_entity_1.VariationOption();
                    newOption.id = newOptionDto.id;
                    newOption.name = newOptionDto.name;
                    newOption.value = newOptionDto.value;
                    await this.variationOptionRepository.save(newOption);
                    variation.options.push(newOption);
                }
                await this.variationRepository.save(variation);
            }
            if (updateProductDto.variation_options.delete) {
                for (const deleteId of updateProductDto.variation_options.delete) {
                    const variation = await this.variationRepository.findOne({
                        where: { id: deleteId },
                        relations: ['options', 'image'],
                    });
                    if (!variation) {
                        throw new common_1.NotFoundException('Variation not found');
                    }
                    const variationImage = variation.image;
                    if (variationImage) {
                        variation.image = null;
                        await this.attachmentRepository.remove(variationImage);
                    }
                    await this.variationRepository.remove(variation);
                }
            }
        }
        if (updateProductDto.variation) {
            const variation = await this.variationRepository.findOne({
                where: { id: updateProductDto.variation.id },
            });
            if (variation) {
                product.variation = variation;
            }
        }
        if (updateProductDto.regionName) {
            const regionNames = Array.isArray(updateProductDto.regionName)
                ? updateProductDto.regionName
                : [updateProductDto.regionName];
            if (regionNames && regionNames.length > 0) {
                const regions = await this.regionRepository.find({
                    where: {
                        name: (0, typeorm_2.In)(regionNames),
                    },
                });
                const existingRegionNames = regions.map((region) => region.name);
                const missingRegionNames = regionNames.filter((name) => !existingRegionNames.includes(name));
                if (missingRegionNames.length > 0) {
                }
                product.regions = regions;
            }
        }
        return await this.productRepository.save(product);
    }
    async remove(id) {
        const product = await this.productRepository.findOne({
            where: { id: id },
            relations: [
                'type',
                'shop',
                'image',
                'categories',
                'tags',
                'gallery',
                'related_products',
                'variations',
                'variation_options',
                'subCategories',
            ],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        product.tags = [];
        product.type = null;
        product.related_products = [];
        product.orders = [];
        await this.productRepository.save(product);
        if (product.categories) {
            await Promise.all(product.categories.map(async (category) => {
                if (category.products) {
                    category.products = category.products.filter((p) => p.id !== product.id);
                    await this.categoryRepository.save(category);
                }
            }));
        }
        const relatedRecords = await this.dealerProductMarginRepository.find({
            where: { product: { id: product.id } },
        });
        await Promise.all(relatedRecords.map(async (record) => {
            await this.dealerProductMarginRepository.delete(record.id);
        }));
        if (product.subCategories) {
            await Promise.all(product.subCategories.map(async (subCategory) => {
                if (subCategory.products) {
                    subCategory.products = subCategory.products.filter((p) => p.id !== product.id);
                    await this.subCategoryRepository.save(subCategory);
                }
            }));
        }
        if (product.image) {
            const image = product.image;
            product.image = null;
            await this.productRepository.save(product);
            const V_image = await this.attachmentRepository.findOne({
                where: { id: image.id },
            });
            if (V_image) {
                await this.attachmentRepository.remove(V_image);
            }
            await this.attachmentRepository.remove(image);
        }
        if (product.gallery && product.gallery.length > 0) {
            const gallery = await this.attachmentRepository.findByIds(product.gallery.map((g) => g.id));
            await this.attachmentRepository.remove(gallery);
        }
        const variations = await Promise.all(product.variation_options.map(async (v) => {
            const variation = await this.variationRepository.findOne({
                where: { id: v.id },
                relations: ['options', 'image'],
            });
            if (!variation) {
                throw new common_1.NotFoundException(`Variation with ID ${v.id} not found`);
            }
            return variation;
        }));
        await Promise.all([
            ...variations.flatMap((v) => v.options ? [this.variationOptionRepository.remove(v.options)] : []),
            ...variations.map(async (v) => {
                if (v.image && v.image.length > 0) {
                    const images = v.image;
                    v.image = null;
                    await this.variationRepository.save(v);
                    await Promise.all(images.map(async (image) => {
                        const attachment = await this.attachmentRepository.findOne({
                            where: { id: image.id },
                        });
                        if (attachment) {
                            await this.attachmentRepository.remove(attachment);
                        }
                    }));
                }
            }),
            this.variationRepository.remove(variations),
            this.productRepository.remove(product),
        ]);
    }
    async updateQuantity(id, updateQuantityDto) {
        try {
            await this.productRepository.update(id, {
                quantity: updateQuantityDto.quantity,
            });
        }
        catch (err) {
            throw err;
        }
    }
};
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsService.prototype, "updateProductStockStatus", null);
ProductsService = ProductsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.OrderProductPivot)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Variation)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.VariationOption)),
    __param(4, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(5, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(6, (0, typeorm_1.InjectRepository)(type_entity_1.Type)),
    __param(7, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(8, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(9, (0, typeorm_1.InjectRepository)(category_entity_1.SubCategory)),
    __param(10, (0, typeorm_1.InjectRepository)(attribute_value_entity_1.AttributeValue)),
    __param(11, (0, typeorm_1.InjectRepository)(dealer_entity_1.Dealer)),
    __param(12, (0, typeorm_1.InjectRepository)(dealer_entity_1.DealerProductMargin)),
    __param(13, (0, typeorm_1.InjectRepository)(dealer_entity_1.DealerCategoryMargin)),
    __param(14, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(15, (0, typeorm_1.InjectRepository)(tax_entity_1.Tax)),
    __param(16, (0, typeorm_1.InjectRepository)(region_entity_1.Region)),
    __param(17, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
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
        typeorm_2.Repository, Object])
], ProductsService);
exports.ProductsService = ProductsService;
//# sourceMappingURL=products.service.js.map
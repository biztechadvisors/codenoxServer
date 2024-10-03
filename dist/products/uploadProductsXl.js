"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadXlService = void 0;
const XLSX = __importStar(require("xlsx"));
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const attribute_value_entity_1 = require("../attributes/entities/attribute-value.entity");
const tax_entity_1 = require("../taxes/entities/tax.entity");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("./entities/product.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const type_entity_1 = require("../types/entities/type.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const dealer_entity_1 = require("../users/entities/dealer.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_2 = require("typeorm");
let UploadXlService = class UploadXlService {
    constructor(productsService, productRepository, orderProductPivotRepository, variationRepository, variationOptionRepository, attachmentRepository, tagRepository, typeRepository, shopRepository, categoryRepository, attributeValueRepository, fileRepository, dealerRepository, dealerProductMarginRepository, dealerCategoryMarginRepository, userRepository, taxRepository, subCategoryRepository) {
        this.productsService = productsService;
        this.productRepository = productRepository;
        this.orderProductPivotRepository = orderProductPivotRepository;
        this.variationRepository = variationRepository;
        this.variationOptionRepository = variationOptionRepository;
        this.attachmentRepository = attachmentRepository;
        this.tagRepository = tagRepository;
        this.typeRepository = typeRepository;
        this.shopRepository = shopRepository;
        this.categoryRepository = categoryRepository;
        this.attributeValueRepository = attributeValueRepository;
        this.fileRepository = fileRepository;
        this.dealerRepository = dealerRepository;
        this.dealerProductMarginRepository = dealerProductMarginRepository;
        this.dealerCategoryMarginRepository = dealerCategoryMarginRepository;
        this.userRepository = userRepository;
        this.taxRepository = taxRepository;
        this.subCategoryRepository = subCategoryRepository;
    }
    async parseExcelToDto(fileBuffer, shopSlug) {
        try {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            if (!worksheet) {
                throw new Error('Invalid worksheet data.');
            }
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                throw new Error('Invalid JSON data.');
            }
            const headerRow = jsonData[0];
            const rows = jsonData.slice(1);
            const products = {};
            for (const row of rows) {
                if (headerRow.length === 0 || row.length === 0) {
                    continue;
                }
                const productType = row[headerRow.indexOf('Product Type')];
                if (productType === 'child' || productType === 'Child') {
                    const parentId = row[headerRow.indexOf('Parent ID')];
                    if (!parentId || !products[parentId]) {
                        console.error(new Error(`Invalid parent ID ${parentId} for variant.`));
                        return;
                    }
                    if (!products[parentId].variations) {
                        products[parentId].variations = [];
                    }
                    if (!products[parentId].variation_options) {
                        products[parentId].variation_options = { delete: [], upsert: [] };
                    }
                    const variationOptions = await this.createVariation(row, headerRow);
                    const variations = await this.getVariations(row, headerRow);
                    const attributes = await this.parseAttributes(row, headerRow);
                    products[parentId].attributes.push(attributes);
                    products[parentId].variations.push(...variations);
                    products[parentId].variation_options.upsert.push(variationOptions);
                }
                else if (productType === 'parent' || productType === 'Parent') {
                    const productIdIndex = headerRow.indexOf('Product ID');
                    const productId = row[productIdIndex];
                    let parentVariations = [];
                    for (const childRow of rows) {
                        const childProductType = childRow[headerRow.indexOf('Product Type')];
                        const childParentId = childRow[headerRow.indexOf('Parent ID')];
                        if ((childProductType === 'child' || childProductType === 'Child') && childParentId === productId) {
                            const variationOptions = await this.createVariation(childRow, headerRow);
                            parentVariations.push(variationOptions);
                        }
                    }
                    const mainProduct = await this.createMainProduct(row, headerRow, shopSlug, parentVariations);
                    mainProduct.variations = [];
                    mainProduct.attributes = [];
                    mainProduct.variation_options = { delete: [], upsert: [] };
                    products[productId] = mainProduct;
                }
            }
            const finalProducts = Object.values(products);
            return finalProducts;
        }
        catch (error) {
            console.error(`Error parsing Excel file: ${error.message}`);
            throw new Error('Error parsing Excel file.');
        }
    }
    async createMainProduct(row, headerRow, shopSlug, variations) {
        let category = [];
        let subCategories = [];
        let tags = [];
        if (row[headerRow.indexOf('Product Category')]) {
            const categoryNames = row[headerRow.indexOf('Product Category')].split(',').map(name => name.trim());
            for (const categoryName of categoryNames) {
                const categoryRecord = await this.categoryRepository.findOne({ where: { name: categoryName } });
                if (categoryRecord) {
                    category.push(categoryRecord.id);
                }
                else {
                    console.warn(`Category '${categoryName}' not found in the database`);
                }
            }
        }
        if (row[headerRow.indexOf('Product SubCategory')]) {
            const subCategoryNames = row[headerRow.indexOf('Product SubCategory')].split(',').map(name => name.trim());
            for (const subCategoryName of subCategoryNames) {
                const subCategoryRecord = await this.subCategoryRepository.findOne({ where: { name: subCategoryName } });
                if (subCategoryRecord) {
                    subCategories.push(subCategoryRecord.id);
                }
                else {
                    console.warn(`SubCategory '${subCategoryName}' not found in the database`);
                }
            }
        }
        if (row[headerRow.indexOf('Product Tags')]) {
            const tagNames = row[headerRow.indexOf('Product Tags')].split(',').map(name => name.trim());
            for (const tagName of tagNames) {
                const tagRecord = await this.tagRepository.findOne({ where: { name: tagName } });
                if (tagRecord) {
                    tags.push(tagRecord.id);
                }
                else {
                    console.warn(`Tag '${tagName}' not found in the database`);
                }
            }
        }
        let type = null;
        if (row[headerRow.indexOf('Product Collection')]) {
            type = await this.typeRepository.findOne({ where: { name: row[headerRow.indexOf('Product Collection')] } });
            if (!type) {
                console.warn(`Type '${row[headerRow.indexOf('Product Collection')]}' not found in the database`);
            }
        }
        let shop = null;
        if (shopSlug) {
            shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (!shop) {
                throw new Error(`Shop with slug '${shopSlug}' not found`);
            }
        }
        let prices = [];
        let totalQuantity = 0;
        variations.forEach(variation => {
            if (variation.sale_price !== undefined && variation.sale_price !== null) {
                prices.push(parseFloat(variation.sale_price));
            }
            if (variation.price !== undefined && variation.price !== null) {
                prices.push(parseFloat(variation.price));
            }
            totalQuantity += parseInt(variation.quantity, 10);
        });
        const min_price = prices.length > 0 ? Math.min(...prices) : 0;
        const max_price = prices.length > 0 ? Math.max(...prices) : 0;
        const status = row[headerRow.indexOf('Product Status')] || "Published";
        const unit = row[headerRow.indexOf('Product Unit')] || 1;
        const sku = row[headerRow.indexOf('Product SKU')] || null;
        const price = parseFloat(row[headerRow.indexOf('Price')] || "0");
        const salePrice = parseFloat(row[headerRow.indexOf('Sale Price')] || "0");
        const height = row[headerRow.indexOf('Height')] || 1;
        const length = row[headerRow.indexOf('Length')] || 1;
        const width = row[headerRow.indexOf('Width')] || 1;
        return {
            name: row[headerRow.indexOf('Product Name')],
            description: row[headerRow.indexOf('Product Description')],
            product_type: "variable",
            status: status,
            quantity: totalQuantity,
            min_price: min_price,
            max_price: max_price,
            price: price,
            sale_price: salePrice,
            unit: unit,
            sku: sku,
            category: category,
            subCategories: subCategories,
            type_id: type ? type.id : null,
            shop_id: shop ? shop.id : null,
            tags: tags,
            variations: variations,
            attributes: [],
            variation_options: {
                delete: [],
                upsert: []
            },
            height: height,
            length: length,
            width: width,
            related_products: [],
            translated_languages: []
        };
    }
    splitAttributeValues(value) {
        return value
            .split(/[,\|\/\\]/)
            .map((v) => v.trim())
            .filter(Boolean);
    }
    async findAttributeValue(attributeValue) {
        return this.attributeValueRepository.findOne({ where: { value: attributeValue } });
    }
    async createVariation(row, headerRow) {
        const options = await this.createVariationOptions(row, headerRow);
        let title = '';
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined) {
            let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            attributeValue = this.splitAttributeValues(attributeValue);
            attributeValue.forEach(element => {
                if (element) {
                    if (title) {
                        title += '/';
                    }
                    title += element;
                }
            });
            i++;
        }
        return {
            is_digital: row[headerRow.indexOf('Is Digital')] === true,
            sku: row[headerRow.indexOf('Product SKU')],
            name: row[headerRow.indexOf('Product Name')],
            quantity: parseInt(row[headerRow.indexOf('Child Inventory')]),
            sale_price: parseFloat(row[headerRow.indexOf('Sale Price')]),
            price: parseFloat(row[headerRow.indexOf('Price')]),
            is_disable: row[headerRow.indexOf('Is Disable')] === true,
            title,
            options,
            id: null
        };
    }
    async getVariations(row, headerRow) {
        const variations = [];
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)];
            let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            attributeValue = this.splitAttributeValues(attributeValue);
            if (attributeName && attributeValue) {
                for (const element of attributeValue) {
                    const fetchedAttributeValue = await this.findAttributeValue(element);
                    if (!fetchedAttributeValue) {
                        console.warn(`Attribute value '${element}' not found.`);
                    }
                    variations.push({ attribute_value_id: fetchedAttributeValue.id });
                }
            }
            i++;
        }
        return variations;
    }
    async parseAttributes(row, headerRow) {
        const attributes = {};
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)];
            let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            attributeValue = this.splitAttributeValues(attributeValue);
            if (attributeName && attributeValue) {
                for (const element of attributeValue) {
                    const fetchedAttributeValue = await this.findAttributeValue(element);
                    if (!fetchedAttributeValue) {
                        console.warn(`Attribute value '${element}' not found.`);
                    }
                    if (!attributes[attributeName]) {
                        attributes[attributeName] = [];
                    }
                    attributes[attributeName].push(fetchedAttributeValue.id);
                }
            }
            i++;
        }
        return attributes;
    }
    async createVariationOptions(row, headerRow) {
        const variationOptions = [];
        let i = 1;
        while (row[headerRow.indexOf(`Attribute ${i} Name`)] !== undefined && row[headerRow.indexOf(`Attribute ${i} Value`)] !== undefined) {
            const attributeName = row[headerRow.indexOf(`Attribute ${i} Name`)];
            let attributeValue = row[headerRow.indexOf(`Attribute ${i} Value`)];
            attributeValue = this.splitAttributeValues(attributeValue);
            if (attributeName && attributeValue) {
                for (const element of attributeValue) {
                    const attribute = await this.attributeValueRepository.findOne({ where: { value: element } });
                    if (attribute) {
                        variationOptions.push({
                            name: attributeName,
                            value: element,
                        });
                    }
                    else {
                        console.warn(`Attribute value '${element}' not found.`);
                    }
                }
            }
            i++;
        }
        return variationOptions;
    }
    async uploadProductsFromExcel(fileBuffer, shopSlug) {
        try {
            const products = await this.parseExcelToDto(fileBuffer, shopSlug);
            if (products && products.length > 0) {
                for (const product of products) {
                    this.saveProducts(product);
                }
            }
            else {
                this.logger.warn('No products found in Excel file.');
            }
        }
        catch (error) {
            this.logger.error(`Error uploading products from Excel: ${error.message}`);
            throw new Error('Error uploading products from Excel.');
        }
    }
    async saveProducts(createProductDto) {
        var _a, _b;
        try {
            const existingProduct = await this.productRepository.findOne({
                where: [{ name: createProductDto.name }, { slug: createProductDto.slug }]
            });
            let product;
            if (existingProduct) {
                product = existingProduct;
                product.name = createProductDto.name;
                product.slug = createProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                product.description = createProductDto.description;
                product.product_type = createProductDto.product_type;
                product.status = createProductDto.status;
                product.quantity = this.validateNumber(createProductDto.quantity);
                product.max_price = this.validateNumber(createProductDto.max_price) || this.validateNumber(createProductDto.price);
                product.min_price = this.validateNumber(createProductDto.min_price) || this.validateNumber(createProductDto.sale_price);
                product.price = this.validateNumber(createProductDto.price);
                product.sale_price = this.validateNumber(createProductDto.sale_price);
                product.unit = createProductDto.unit ? createProductDto.unit : 1;
                product.height = createProductDto.height ? createProductDto.height : 1;
                product.length = createProductDto.length ? createProductDto.length : 1;
                product.width = createProductDto.width ? createProductDto.width : 1;
                product.sku = createProductDto.sku;
                product.language = createProductDto.language || 'en';
                product.translated_languages = createProductDto.translated_languages || ['en'];
                if (createProductDto.taxes) {
                    const tax = await this.taxRepository.findOne({ where: { id: createProductDto.taxes.id } });
                    if (tax) {
                        product.taxes = tax;
                    }
                }
                if (createProductDto.type_id) {
                    const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
                    if (!type) {
                        throw new common_1.NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
                    }
                    product.type = type;
                    product.type_id = type.id;
                }
                if (createProductDto.shop_id) {
                    const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
                    if (!shop) {
                        throw new common_1.NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
                    }
                    product.shop = shop;
                    product.shop_id = shop.id;
                }
                if (createProductDto.category) {
                    const categories = await this.categoryRepository.findByIds(createProductDto.category);
                    product.categories = categories;
                }
                if (createProductDto.subCategories) {
                    const subCategories = await this.subCategoryRepository.findByIds(createProductDto.subCategories);
                    product.subCategories = subCategories;
                }
                if (createProductDto.tags) {
                    const tags = await this.tagRepository.findByIds(createProductDto.tags);
                    product.tags = tags;
                }
                await this.remove(product.name);
            }
            else {
                product = new product_entity_1.Product();
                product.name = createProductDto.name;
                product.slug = createProductDto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                product.description = createProductDto.description;
                product.product_type = createProductDto.product_type;
                product.status = createProductDto.status;
                product.quantity = this.validateNumber(createProductDto.quantity);
                product.max_price = this.validateNumber(createProductDto.max_price) || this.validateNumber(createProductDto.price);
                product.min_price = this.validateNumber(createProductDto.min_price) || this.validateNumber(createProductDto.sale_price);
                product.price = this.validateNumber(createProductDto.price);
                product.sale_price = this.validateNumber(createProductDto.sale_price);
                product.unit = createProductDto.unit ? createProductDto.unit : 1;
                product.height = createProductDto.height ? createProductDto.height : 1;
                product.length = createProductDto.length ? createProductDto.length : 1;
                product.width = createProductDto.width ? createProductDto.width : 1;
                product.sku = createProductDto.sku;
                product.language = createProductDto.language || 'en';
                product.translated_languages = createProductDto.translated_languages || ['en'];
                if (createProductDto.taxes) {
                    const tax = await this.taxRepository.findOne({ where: { id: createProductDto.taxes.id } });
                    if (tax) {
                        product.taxes = tax;
                    }
                }
                if (createProductDto.type_id) {
                    const type = await this.typeRepository.findOne({ where: { id: createProductDto.type_id } });
                    if (!type) {
                        throw new common_1.NotFoundException(`Type with ID ${createProductDto.type_id} not found`);
                    }
                    product.type = type;
                    product.type_id = type.id;
                }
                if (createProductDto.category) {
                    const categories = await this.categoryRepository.findByIds(createProductDto.category);
                    product.categories = categories;
                }
                if (createProductDto.subCategories) {
                    const subCategories = await this.subCategoryRepository.findByIds(createProductDto.subCategories);
                    product.subCategories = subCategories;
                }
                if (createProductDto.tags) {
                    const tags = await this.tagRepository.findByIds(createProductDto.tags);
                    product.tags = tags;
                }
            }
            if (createProductDto.shop_id) {
                const shop = await this.shopRepository.findOne({ where: { id: createProductDto.shop_id } });
                if (!shop) {
                    throw new common_1.NotFoundException(`Shop with ID ${createProductDto.shop_id} not found`);
                }
                product.shop = shop;
                product.shop_id = shop.id;
            }
            if ((_a = createProductDto === null || createProductDto === void 0 ? void 0 : createProductDto.image) === null || _a === void 0 ? void 0 : _a.id) {
                const image = await this.attachmentRepository.findOne(createProductDto.image.id);
                if (!image) {
                    throw new common_1.NotFoundException(`Image with ID ${createProductDto.image.id} not found`);
                }
                product.image = image;
            }
            if (((_b = createProductDto === null || createProductDto === void 0 ? void 0 : createProductDto.gallery) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                const galleryAttachments = [];
                for (const galleryImage of createProductDto.gallery) {
                    const image = await this.attachmentRepository.findOne(galleryImage.id);
                    if (!image) {
                        throw new common_1.NotFoundException(`Gallery image with ID ${galleryImage.id} not found`);
                    }
                    galleryAttachments.push(image);
                }
                product.gallery = galleryAttachments;
            }
            if (createProductDto.variations) {
                try {
                    const attributeValueIds = [...new Set(createProductDto.variations.map(v => v.attribute_value_id))];
                    const attributeValues = await this.attributeValueRepository.findByIds(attributeValueIds);
                    const attributeValueMap = new Map(attributeValues.map(attr => [attr.id, attr]));
                    const uniqueVariations = new Set();
                    product.variations = createProductDto.variations
                        .filter(variation => {
                        if (uniqueVariations.has(variation.attribute_value_id)) {
                            console.warn(`Duplicate attribute value ID ${variation.attribute_value_id} found and ignored`);
                            return false;
                        }
                        uniqueVariations.add(variation.attribute_value_id);
                        return true;
                    })
                        .map(variation => {
                        const attributeValue = attributeValueMap.get(variation.attribute_value_id);
                        if (!attributeValue) {
                            throw new common_1.NotFoundException(`Attribute value with ID ${variation.attribute_value_id} not found`);
                        }
                        return attributeValue;
                    });
                    await this.productRepository.save(product);
                }
                catch (error) {
                    console.error('Error handling variations:', error);
                    if (error instanceof common_1.NotFoundException) {
                        throw error;
                    }
                    else {
                        throw new common_1.InternalServerErrorException('An error occurred while processing variations');
                    }
                }
            }
            else {
                console.warn('No variations provided in createProductDto');
            }
            if (product.product_type === product_entity_1.ProductType.VARIABLE &&
                createProductDto.variation_options &&
                createProductDto.variation_options.upsert) {
                try {
                    const variationOptions = [];
                    for (const variationDto of createProductDto.variation_options.upsert) {
                        const newVariation = new product_entity_1.Variation();
                        newVariation.title = variationDto === null || variationDto === void 0 ? void 0 : variationDto.title;
                        newVariation.name = variationDto === null || variationDto === void 0 ? void 0 : variationDto.name;
                        newVariation.price = this.validateNumber(variationDto === null || variationDto === void 0 ? void 0 : variationDto.price);
                        newVariation.sku = variationDto === null || variationDto === void 0 ? void 0 : variationDto.sku;
                        newVariation.is_disable = variationDto === null || variationDto === void 0 ? void 0 : variationDto.is_disable;
                        newVariation.sale_price = this.validateNumber(variationDto === null || variationDto === void 0 ? void 0 : variationDto.sale_price);
                        newVariation.quantity = this.validateNumber(variationDto === null || variationDto === void 0 ? void 0 : variationDto.quantity);
                        newVariation.created_at = new Date();
                        newVariation.updated_at = new Date();
                        if (variationDto === null || variationDto === void 0 ? void 0 : variationDto.image) {
                            let image = await this.fileRepository.findOne({ where: { id: variationDto.image.id } });
                            if (!image) {
                                image = new product_entity_1.File();
                                image.attachment_id = variationDto.image.id;
                                image.url = variationDto.image.original;
                                image.fileable_id = newVariation.id;
                                await this.fileRepository.save(image);
                            }
                            newVariation.image = image;
                        }
                        const savedVariation = await this.variationRepository.save(newVariation);
                        const variationOptionEntities = [];
                        if (variationDto === null || variationDto === void 0 ? void 0 : variationDto.options) {
                            for (const option of variationDto.options) {
                                const newVariationOption = new product_entity_1.VariationOption();
                                newVariationOption.name = option.name;
                                newVariationOption.value = option.value;
                                const savedVariationOption = await this.variationOptionRepository.save(newVariationOption);
                                variationOptionEntities.push(savedVariationOption);
                            }
                        }
                        savedVariation.options = variationOptionEntities;
                        await this.variationRepository.save(savedVariation);
                        variationOptions.push(savedVariation);
                    }
                    product.variation_options = variationOptions;
                    await this.productRepository.save(product);
                }
                catch (error) {
                    console.error('Error handling variation options:', error);
                    throw new common_1.InternalServerErrorException('An error occurred while processing variation options');
                }
            }
            else {
                console.warn('No variation options provided in createProductDto');
            }
            if (product) {
                await this.productsService.updateShopProductsCount(product.shop_id, product.id);
            }
            return product;
        }
        catch (error) {
            console.log('error', error);
            throw new Error('Error saving products: ' + error.message);
        }
    }
    validateNumber(value) {
        if (isNaN(value)) {
            return 0;
        }
        return Number(value);
    }
    async remove(name) {
        const products = await this.productRepository.find({ where: { name: name }, relations: ['type', 'shop', 'image', 'categories', 'tags', 'gallery', 'related_products', 'variations', 'variation_options'] });
        for (const product of products) {
            if (!product) {
                throw new common_1.NotFoundException(`Product with Name ${name} not found`);
            }
            if (product.image) {
                const image = product.image;
                product.image = null;
                await this.productRepository.save(product);
                const file = await this.fileRepository.findOne({ where: { attachment_id: image.id } });
                if (file) {
                    await this.fileRepository.remove(file);
                }
                await this.attachmentRepository.remove(image);
            }
            const gallery = await this.attachmentRepository.findByIds(product.gallery.map(g => g.id));
            await this.attachmentRepository.remove(gallery);
            const variations = await Promise.all(product.variation_options.map(async (v) => {
                const variation = await this.variationRepository.findOne({ where: { id: v.id }, relations: ['options', 'image'] });
                if (!variation) {
                    throw new common_1.NotFoundException(`Variation with ID ${v.id} not found`);
                }
                return variation;
            }));
            await Promise.all([
                ...variations.flatMap(v => v.options ? [this.variationOptionRepository.remove(v.options)] : []),
                ...variations.map(async (v) => {
                    if (v.image) {
                        const image = v.image;
                        v.image = null;
                        await this.variationRepository.save(v);
                        const file = await this.fileRepository.findOne({ where: { id: image.id } });
                        if (file) {
                            file.attachment_id = null;
                            await this.fileRepository.save(file).then(async () => {
                                await this.fileRepository.remove(file);
                            });
                        }
                        const attachment = await this.attachmentRepository.findOne({ where: { id: image.attachment_id } });
                        if (attachment) {
                            await this.attachmentRepository.remove(attachment);
                        }
                    }
                }),
                this.variationRepository.remove(variations),
                this.productRepository.remove(product),
            ]);
        }
    }
};
UploadXlService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.OrderProductPivot)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Variation)),
    __param(4, (0, typeorm_1.InjectRepository)(product_entity_1.VariationOption)),
    __param(5, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(6, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(7, (0, typeorm_1.InjectRepository)(type_entity_1.Type)),
    __param(8, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(9, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(10, (0, typeorm_1.InjectRepository)(attribute_value_entity_1.AttributeValue)),
    __param(11, (0, typeorm_1.InjectRepository)(product_entity_1.File)),
    __param(12, (0, typeorm_1.InjectRepository)(dealer_entity_1.Dealer)),
    __param(13, (0, typeorm_1.InjectRepository)(dealer_entity_1.DealerProductMargin)),
    __param(14, (0, typeorm_1.InjectRepository)(dealer_entity_1.DealerCategoryMargin)),
    __param(15, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(16, (0, typeorm_1.InjectRepository)(tax_entity_1.Tax)),
    __param(17, (0, typeorm_1.InjectRepository)(category_entity_1.SubCategory)),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
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
        typeorm_2.Repository])
], UploadXlService);
exports.UploadXlService = UploadXlService;
//# sourceMappingURL=uploadProductsXl.js.map
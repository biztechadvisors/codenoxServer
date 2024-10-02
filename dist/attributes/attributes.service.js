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
var AttributesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesService = void 0;
const common_1 = require("@nestjs/common");
const attribute_entity_1 = require("./entities/attribute.entity");
const typeorm_1 = require("@nestjs/typeorm");
const attribute_value_entity_1 = require("./entities/attribute-value.entity");
const helpers_1 = require("../helpers");
const shop_entity_1 = require("../shops/entities/shop.entity");
const typeorm_2 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
let AttributesService = AttributesService_1 = class AttributesService {
    constructor(attributeRepository, attributeValueRepository, shopRepository, cacheManager) {
        this.attributeRepository = attributeRepository;
        this.attributeValueRepository = attributeValueRepository;
        this.shopRepository = shopRepository;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(AttributesService_1.name);
    }
    async convertToSlug(text) {
        return await (0, helpers_1.convertToSlug)(text);
    }
    getValueFromSearch(searchString, key) {
        const regex = new RegExp(`${key}:(\\d+)`);
        const match = searchString.match(regex);
        return match ? match[1] : null;
    }
    async create(createAttributeDto) {
        const existingAttribute = await this.attributeRepository.findOne({
            where: { name: createAttributeDto.name, shop_id: createAttributeDto.shop_id },
            relations: ['values',
                'shop'
            ],
        });
        const shop = await this.shopRepository.findOne({ where: { id: Number(createAttributeDto.shop_id) } });
        if (!existingAttribute) {
            const newAttribute = new attribute_entity_1.Attribute();
            newAttribute.name = createAttributeDto.name;
            newAttribute.slug = await this.convertToSlug(createAttributeDto.name);
            newAttribute.shop_id = createAttributeDto.shop_id;
            newAttribute.shop = shop;
            newAttribute.language = createAttributeDto.language;
            const savedAttribute = await this.attributeRepository.save(newAttribute);
            const attributeValues = createAttributeDto.values.map((attributeValueDto) => {
                const attributeValue = new attribute_value_entity_1.AttributeValue();
                attributeValue.attribute = savedAttribute;
                attributeValue.value = attributeValueDto.value;
                attributeValue.meta = attributeValueDto.meta;
                return attributeValue;
            });
            await this.attributeValueRepository.save(attributeValues);
            return savedAttribute;
        }
        const existingAttributeValues = existingAttribute.values;
        for (const newAttributeValue of createAttributeDto.values) {
            const existingAttributeValue = existingAttributeValues.find((atValue) => atValue.value === newAttributeValue.value);
            if (existingAttributeValue) {
                existingAttributeValue.meta = newAttributeValue.meta;
            }
            else {
                const newAttributeValueEntity = new attribute_value_entity_1.AttributeValue();
                newAttributeValueEntity.attribute = existingAttribute;
                newAttributeValueEntity.value = newAttributeValue.value;
                newAttributeValueEntity.meta = newAttributeValue.meta;
                existingAttributeValues.push(newAttributeValueEntity);
            }
        }
        await this.attributeValueRepository.save(existingAttributeValues);
        return existingAttribute;
    }
    async findAll(params) {
        const { search, orderBy, sortedBy, language, shopSlug, shop_id } = params;
        const cacheKey = `attributes:${JSON.stringify(params)}`;
        const cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            this.logger.log(`Cache hit for key: ${cacheKey}`);
            return cachedResult;
        }
        const query = this.attributeRepository.createQueryBuilder('attribute')
            .leftJoinAndSelect('attribute.values', 'value')
            .leftJoinAndSelect('attribute.shop', 'shop');
        if (shop_id) {
            query.where('attribute.shop_id = :shop_id', { shop_id });
        }
        else if (shopSlug) {
            query.where('shop.slug = :shopSlug', { shopSlug });
        }
        if (language) {
            query.andWhere('attribute.language = :language', { language });
        }
        if (search) {
            query.andWhere('(attribute.name LIKE :search OR value.value LIKE :search)', { search: `%${search}%` });
        }
        if (orderBy && sortedBy) {
            query.orderBy(`attribute.${orderBy}`, sortedBy.toUpperCase());
        }
        const attributes = await query.getMany();
        const formattedAttributes = attributes.map((attribute) => {
            return {
                id: attribute.id,
                name: attribute.name,
                slug: attribute.slug,
                values: attribute.values.map((value) => ({
                    id: value.id,
                    value: value.value,
                    meta: value.meta,
                })),
            };
        });
        await this.cacheManager.set(cacheKey, formattedAttributes, 60);
        this.logger.log(`Data cached with key: ${cacheKey}`);
        return formattedAttributes;
    }
    async findOne(param) {
        const cacheKey = `attribute:${param.id || param.slug}`;
        const cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            this.logger.log(`Cache hit for key: ${cacheKey}`);
            return cachedResult;
        }
        const result = await this.attributeRepository.findOne({
            where: [
                { id: param.id },
                { slug: param.slug },
            ],
            relations: ['values'],
        });
        if (result) {
            await this.cacheManager.set(cacheKey, result, 60);
            this.logger.log(`Data cached with key: ${cacheKey}`);
            return result;
        }
        else {
            const notFoundMessage = { message: "Attribute Not Found" };
            await this.cacheManager.set(cacheKey, notFoundMessage, 60);
            this.logger.log(`Data cached with key: ${cacheKey}`);
            return notFoundMessage;
        }
    }
    async update(id, updateAttributeDto) {
        const attribute = await this.attributeRepository.findOne({
            where: { id },
            relations: ['values'],
        });
        const shop = await this.shopRepository.findOne({ where: { id: Number(updateAttributeDto.shop_id) } });
        if (!attribute) {
            return {
                status: false,
                message: 'Attribute not found',
            };
        }
        attribute.name = updateAttributeDto.name;
        attribute.slug = await this.convertToSlug(updateAttributeDto.name);
        attribute.shop_id = updateAttributeDto.shop_id;
        attribute.shop = shop;
        attribute.language = updateAttributeDto.language;
        const updatedValues = updateAttributeDto.values.map((valueDto) => valueDto.value);
        const valuesToRemove = attribute.values.filter((value) => !updatedValues.includes(value.value));
        await this.attributeValueRepository.remove(valuesToRemove);
        for (const updateAttributeValueDto of updateAttributeDto.values) {
            let attributeValue = attribute.values.find((atValue) => atValue.value === updateAttributeValueDto.value);
            if (!attributeValue) {
                attributeValue = new attribute_value_entity_1.AttributeValue();
                attributeValue.attribute = attribute;
                attribute.values.push(attributeValue);
            }
            attributeValue.value = updateAttributeValueDto.value;
            attributeValue.meta = updateAttributeValueDto.meta;
            await this.attributeValueRepository.save(attributeValue);
        }
        await this.attributeRepository.save(attribute);
        const responseDto = {
            id: attribute.id,
            name: attribute.name,
            slug: attribute.slug,
            shop_id: parseInt(attribute.shop_id),
            language: attribute.language,
            values: attribute.values.map((value) => ({ value: value.value, meta: value.meta })),
        };
        return responseDto;
    }
    async delete(id) {
        const attribute = await this.attributeRepository.findOne({
            where: { id },
            relations: ['values'],
        });
        if (!attribute) {
            throw new Error(`Attribute with ID ${id} not found`);
        }
        await Promise.all(attribute.values.map(async (attributeValue) => {
            await this.attributeValueRepository.delete(attributeValue.id);
        }));
        await this.attributeRepository.delete(attribute.id);
    }
};
AttributesService = AttributesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attribute_entity_1.Attribute)),
    __param(1, (0, typeorm_1.InjectRepository)(attribute_value_entity_1.AttributeValue)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], AttributesService);
exports.AttributesService = AttributesService;
//# sourceMappingURL=attributes.service.js.map
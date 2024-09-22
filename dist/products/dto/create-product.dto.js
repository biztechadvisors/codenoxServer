"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDto = exports.VariationOptionDto = exports.VariationDto = exports.CreateProductDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const product_entity_1 = require("../entities/product.entity");
class CreateProductDto extends (0, swagger_1.OmitType)(product_entity_1.Product, [
    'id',
    'slug',
    'created_at',
    'updated_at',
    'orders',
    'pivot',
    'shop',
    'categories',
    'subCategories',
    'tags',
    'type',
    'related_products',
    'variations',
    'variation_options',
    'translated_languages',
    'taxes',
    'height',
    'length',
    'width',
    'regionName'
]) {
    constructor() {
        super(...arguments);
        this.variation_options = { delete: [], upsert: [] };
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { categories: { required: true, type: () => [Number] }, subCategories: { required: true, type: () => [Number] }, tags: { required: true, type: () => [Number] }, type_id: { required: true, type: () => Number }, shop_id: { required: true, type: () => Number }, taxes: { required: true, type: () => require("../../taxes/entities/tax.entity").Tax }, variations: { required: true, type: () => [require("../../attributes/entities/attribute-value.entity").AttributeValue] }, related_products: { required: true, type: () => [require("../entities/product.entity").Product] }, translated_languages: { required: true, type: () => [String] }, regionName: { required: true, type: () => [String] } };
    }
}
exports.CreateProductDto = CreateProductDto;
class VariationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { is_digital: { required: true, type: () => Boolean }, sku: { required: true, type: () => String }, quantity: { required: true, type: () => Number }, sale_price: { required: true, type: () => Number }, price: { required: true, type: () => Number }, is_disable: { required: true, type: () => Boolean }, title: { required: true, type: () => String }, image: { required: true, type: () => require("./create-product.dto").FileDto }, options: { required: true, type: () => [require("./create-product.dto").VariationOptionDto] }, id: { required: true, type: () => Object } };
    }
}
exports.VariationDto = VariationDto;
class VariationOptionDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, value: { required: true, type: () => String } };
    }
}
exports.VariationOptionDto = VariationOptionDto;
class FileDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { thumbnail: { required: true, type: () => String }, original: { required: true, type: () => String }, id: { required: true, type: () => Number }, file_name: { required: true, type: () => String } };
    }
}
exports.FileDto = FileDto;
//# sourceMappingURL=create-product.dto.js.map
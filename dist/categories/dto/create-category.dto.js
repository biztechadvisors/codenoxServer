"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubCategoryDto = exports.CreateCategoryDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const category_entity_1 = require("../entities/category.entity");
class CreateCategoryDto extends (0, swagger_1.PickType)(category_entity_1.Category, [
    'name',
    'type',
    'details',
    'parent',
    'icon',
    'image',
    'language',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { shop_id: { required: true, type: () => Number }, type_id: { required: true, type: () => Number }, image_id: { required: false, type: () => Number }, region_name: { required: true, type: () => [String] } };
    }
}
exports.CreateCategoryDto = CreateCategoryDto;
class CreateSubCategoryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, category_id: { required: true, type: () => Number }, details: { required: false, type: () => String }, image: { required: false, type: () => ({ id: { required: true, type: () => Number } }) }, language: { required: true, type: () => String }, shop_id: { required: true, type: () => Number }, regionName: { required: true, type: () => [String] } };
    }
}
exports.CreateSubCategoryDto = CreateSubCategoryDto;
//# sourceMappingURL=create-category.dto.js.map
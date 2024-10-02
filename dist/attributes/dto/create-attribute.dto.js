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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeResponseDto = exports.AttributeValueDto = exports.CreateAttributeDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const attribute_entity_1 = require("../entities/attribute.entity");
const class_validator_1 = require("class-validator");
class CreateAttributeDto extends (0, swagger_1.PickType)(attribute_entity_1.Attribute, [
    'name',
    'shop_id',
    'slug',
    'language',
]) {
    static _OPENAPI_METADATA_FACTORY() {
        return { values: { required: true, type: () => [require("./create-attribute.dto").AttributeValueDto] }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop } };
    }
}
exports.CreateAttributeDto = CreateAttributeDto;
class AttributeValueDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, value: { required: true, type: () => String }, meta: { required: false, type: () => String }, language: { required: false, type: () => String } };
    }
}
exports.AttributeValueDto = AttributeValueDto;
class AttributeResponseDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, shop_id: { required: false, type: () => Number }, language: { required: false, type: () => String }, values: { required: false } };
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Number)
], AttributeResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttributeResponseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttributeResponseDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AttributeResponseDto.prototype, "shop_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AttributeResponseDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AttributeResponseDto.prototype, "values", void 0);
exports.AttributeResponseDto = AttributeResponseDto;
//# sourceMappingURL=create-attribute.dto.js.map
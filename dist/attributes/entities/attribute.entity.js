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
exports.Attribute = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const attribute_value_entity_1 = require("./attribute-value.entity");
const typeorm_1 = require("typeorm");
let Attribute = class Attribute extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, shop_id: { required: true, type: () => String }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, slug: { required: true, type: () => String }, values: { required: true, type: () => [require("./attribute-value.entity").AttributeValue] }, language: { required: true, type: () => String }, translated_languages: { required: true, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Attribute.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attribute.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attribute.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", shop_entity_1.Shop)
], Attribute.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attribute.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attribute_value_entity_1.AttributeValue, attributeValue => attributeValue.attribute),
    __metadata("design:type", Array)
], Attribute.prototype, "values", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attribute.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], Attribute.prototype, "translated_languages", void 0);
Attribute = __decorate([
    (0, typeorm_1.Entity)()
], Attribute);
exports.Attribute = Attribute;
//# sourceMappingURL=attribute.entity.js.map
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
exports.Manufacturer = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const setting_entity_1 = require("../../settings/entities/setting.entity");
const type_entity_1 = require("../../types/entities/type.entity");
const typeorm_1 = require("typeorm");
let Manufacturer = class Manufacturer extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, cover_image: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, description: { required: false, type: () => String }, image: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, is_approved: { required: false, type: () => Boolean }, name: { required: true, type: () => String }, products_count: { required: false, type: () => Number }, slug: { required: false, type: () => String }, socials: { required: false, type: () => require("../../settings/entities/setting.entity").ShopSocials }, type: { required: true, type: () => require("../../types/entities/type.entity").Type }, type_id: { required: false, type: () => String }, website: { required: false, type: () => String }, language: { required: false, type: () => String }, translated_languages: { required: false, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Manufacturer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => attachment_entity_1.Attachment, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], Manufacturer.prototype, "cover_image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Manufacturer.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => attachment_entity_1.Attachment, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], Manufacturer.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Manufacturer.prototype, "is_approved", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Manufacturer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Manufacturer.prototype, "products_count", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Manufacturer.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => setting_entity_1.ShopSocials),
    __metadata("design:type", setting_entity_1.ShopSocials)
], Manufacturer.prototype, "socials", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => type_entity_1.Type, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", type_entity_1.Type)
], Manufacturer.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Manufacturer.prototype, "type_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Manufacturer.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Manufacturer.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], Manufacturer.prototype, "translated_languages", void 0);
Manufacturer = __decorate([
    (0, typeorm_1.Entity)()
], Manufacturer);
exports.Manufacturer = Manufacturer;
//# sourceMappingURL=manufacturer.entity.js.map
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
exports.Author = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const setting_entity_1 = require("../../settings/entities/setting.entity");
const typeorm_1 = require("typeorm");
let Author = class Author extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, bio: { required: false, type: () => String }, born: { required: false, type: () => String }, cover_image: { required: true, type: () => require("../../common/entities/attachment.entity").Attachment }, death: { required: false, type: () => String }, image: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, is_approved: { required: false, type: () => Boolean }, languages: { required: false, type: () => String }, name: { required: true, type: () => String }, products_count: { required: false, type: () => Number }, quote: { required: false, type: () => String }, slug: { required: false, type: () => String }, socials: { required: true, type: () => [require("../../settings/entities/setting.entity").ShopSocials] }, language: { required: false, type: () => String }, translated_languages: { required: false, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Author.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "born", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => attachment_entity_1.Attachment, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], Author.prototype, "cover_image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "death", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => attachment_entity_1.Attachment, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], Author.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Author.prototype, "is_approved", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "languages", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Author.prototype, "products_count", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "quote", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => setting_entity_1.ShopSocials, { cascade: true }),
    (0, typeorm_1.JoinTable)({ name: "author_shopSocils" }),
    __metadata("design:type", Array)
], Author.prototype, "socials", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Author.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], Author.prototype, "translated_languages", void 0);
Author = __decorate([
    (0, typeorm_1.Entity)()
], Author);
exports.Author = Author;
//# sourceMappingURL=author.entity.js.map
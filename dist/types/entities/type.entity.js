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
exports.Banner = exports.Type = exports.TypeSettings = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const core_entity_1 = require("../../common/entities/core.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const tag_entity_1 = require("../../tags/entities/tag.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const region_entity_1 = require("../../region/entities/region.entity");
let TypeSettings = class TypeSettings {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, isHome: { required: true, type: () => Boolean }, layoutType: { required: true, type: () => String }, productCard: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TypeSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], TypeSettings.prototype, "isHome", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TypeSettings.prototype, "layoutType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TypeSettings.prototype, "productCard", void 0);
TypeSettings = __decorate([
    (0, typeorm_1.Entity)()
], TypeSettings);
exports.TypeSettings = TypeSettings;
let Type = class Type extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, image: { required: true, type: () => require("../../common/entities/attachment.entity").Attachment }, icon: { required: true, type: () => String }, banners: { required: false, type: () => [require("./type.entity").Banner] }, promotional_sliders: { required: false, type: () => [require("../../common/entities/attachment.entity").Attachment] }, settings: { required: false, type: () => require("./type.entity").TypeSettings }, products: { required: false, type: () => [require("../../products/entities/product.entity").Product] }, tags: { required: false, type: () => [require("../../tags/entities/tag.entity").Tag] }, categories: { required: false, type: () => [require("../../categories/entities/category.entity").Category] }, shop: { required: false, type: () => require("../../shops/entities/shop.entity").Shop }, regions: { required: true, type: () => [require("../../region/entities/region.entity").Region] }, language: { required: true, type: () => String }, translated_languages: { required: true, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Type.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Type.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Type.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => attachment_entity_1.Attachment, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], Type.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Type.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Banner, (banner) => banner.type, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Type.prototype, "banners", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinTable)({
        name: 'type_promotional_sliders',
        joinColumn: { name: 'typeId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Type.prototype, "promotional_sliders", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => TypeSettings, { cascade: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", TypeSettings)
], Type.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, (product) => product.type, { onDelete: "SET NULL" }),
    __metadata("design:type", Array)
], Type.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tag_entity_1.Tag, (tag) => tag.type, { onDelete: "SET NULL" }),
    __metadata("design:type", Array)
], Type.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => category_entity_1.Category, (category) => category.type, { onDelete: "SET NULL" }),
    __metadata("design:type", Array)
], Type.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", shop_entity_1.Shop)
], Type.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => region_entity_1.Region, (region) => region.types, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinTable)({
        name: 'types_regions',
        joinColumn: { name: 'typeId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Type.prototype, "regions", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Type.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], Type.prototype, "translated_languages", void 0);
Type = __decorate([
    (0, typeorm_1.Entity)()
], Type);
exports.Type = Type;
let Banner = class Banner {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: false, type: () => String }, description: { required: false, type: () => String }, type: { required: true, type: () => require("./type.entity").Type }, image: { required: true, type: () => require("../../common/entities/attachment.entity").Attachment, nullable: true } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Banner.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Banner.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Banner.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Type, (type) => type.banners, { onDelete: "SET NULL" }),
    __metadata("design:type", Type)
], Banner.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attachment_entity_1.Attachment, { cascade: true, eager: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'imageId' }),
    __metadata("design:type", attachment_entity_1.Attachment)
], Banner.prototype, "image", void 0);
Banner = __decorate([
    (0, typeorm_1.Entity)()
], Banner);
exports.Banner = Banner;
//# sourceMappingURL=type.entity.js.map
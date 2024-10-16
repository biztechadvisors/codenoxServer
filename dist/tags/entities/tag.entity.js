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
exports.Tag = void 0;
const openapi = require("@nestjs/swagger");
const region_entity_1 = require("../../region/entities/region.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const core_entity_1 = require("../../common/entities/core.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const type_entity_1 = require("../../types/entities/type.entity");
const typeorm_1 = require("typeorm");
let Tag = class Tag extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, parent: { required: true, type: () => Number, nullable: true }, details: { required: true, type: () => String }, image: { required: true, type: () => require("../../common/entities/attachment.entity").Attachment, nullable: true }, icon: { required: true, type: () => String }, type: { required: true, type: () => require("../../types/entities/type.entity").Type, nullable: true }, regions: { required: true, type: () => [require("../../region/entities/region.entity").Region] }, products: { required: true, type: () => [require("../../products/entities/product.entity").Product] }, shop: { required: false, type: () => require("../../shops/entities/shop.entity").Shop }, language: { required: true, type: () => String }, translatedLanguages: { required: true, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Tag.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tag.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Tag.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Tag.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tag.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attachment_entity_1.Attachment, { cascade: true, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: 'imageId', referencedColumnName: 'id' }),
    __metadata("design:type", attachment_entity_1.Attachment)
], Tag.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tag.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => type_entity_1.Type, (type) => type.tags, { onDelete: 'SET NULL' }),
    __metadata("design:type", type_entity_1.Type)
], Tag.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => region_entity_1.Region, (region) => region.tags),
    (0, typeorm_1.JoinTable)({
        name: 'tags_regions',
        joinColumn: { name: 'tagsId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Tag.prototype, "regions", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, (product) => product.tags),
    __metadata("design:type", Array)
], Tag.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, { onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", shop_entity_1.Shop)
], Tag.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tag.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Tag.prototype, "translatedLanguages", void 0);
Tag = __decorate([
    (0, typeorm_1.Entity)()
], Tag);
exports.Tag = Tag;
//# sourceMappingURL=tag.entity.js.map
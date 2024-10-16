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
var Category_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCategory = exports.Category = void 0;
const openapi = require("@nestjs/swagger");
const region_entity_1 = require("../../region/entities/region.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const core_entity_1 = require("../../common/entities/core.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const type_entity_1 = require("../../types/entities/type.entity");
const typeorm_1 = require("typeorm");
let Category = Category_1 = class Category extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, parent: { required: false, type: () => require("./category.entity").Category }, children: { required: false, type: () => [require("./category.entity").Category] }, subCategories: { required: true, type: () => [require("./category.entity").SubCategory] }, regions: { required: true, type: () => [require("../../region/entities/region.entity").Region] }, details: { required: false, type: () => String }, image: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, icon: { required: false, type: () => String }, type: { required: true, type: () => require("../../types/entities/type.entity").Type, nullable: true }, products: { required: true, type: () => [require("../../products/entities/product.entity").Product] }, shop: { required: false, type: () => require("../../shops/entities/shop.entity").Shop }, language: { required: true, type: () => String }, translated_languages: { required: true, type: () => [String] }, products_count: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Category.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Category_1, { nullable: true, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Category)
], Category.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Category_1, (category) => category.parent, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Category.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SubCategory, (subCategory) => subCategory.category, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Category.prototype, "subCategories", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => region_entity_1.Region, (region) => region.categories, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinTable)({
        name: 'categories_regions',
        joinColumn: { name: 'categoryId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Category.prototype, "regions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attachment_entity_1.Attachment, { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], Category.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => type_entity_1.Type, (type) => type.categories, { onUpdate: "CASCADE", onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: 'typeId' }),
    __metadata("design:type", type_entity_1.Type)
], Category.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, (product) => product.categories, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Category.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, (shop) => shop.categories),
    __metadata("design:type", shop_entity_1.Shop)
], Category.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Category.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Category.prototype, "translated_languages", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Category.prototype, "products_count", void 0);
Category = Category_1 = __decorate([
    (0, typeorm_1.Entity)()
], Category);
exports.Category = Category;
let SubCategory = class SubCategory extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, category: { required: true, type: () => require("./category.entity").Category }, products: { required: true, type: () => [require("../../products/entities/product.entity").Product] }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, regions: { required: true, type: () => [require("../../region/entities/region.entity").Region] }, details: { required: false, type: () => String }, image: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, language: { required: true, type: () => String }, translated_languages: { required: true, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubCategory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubCategory.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubCategory.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Category, (category) => category.subCategories),
    __metadata("design:type", Category)
], SubCategory.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, (product) => product.subCategories, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], SubCategory.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, (shop) => shop.subCategories),
    __metadata("design:type", shop_entity_1.Shop)
], SubCategory.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => region_entity_1.Region, (region) => region.subCategories, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinTable)({
        name: 'subcategories_regions',
        joinColumn: { name: 'subCategoryId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'regionId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], SubCategory.prototype, "regions", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubCategory.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attachment_entity_1.Attachment, { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], SubCategory.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubCategory.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], SubCategory.prototype, "translated_languages", void 0);
SubCategory = __decorate([
    (0, typeorm_1.Entity)()
], SubCategory);
exports.SubCategory = SubCategory;
//# sourceMappingURL=category.entity.js.map
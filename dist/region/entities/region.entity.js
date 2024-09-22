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
exports.Region = void 0;
const openapi = require("@nestjs/swagger");
const blog_entity_1 = require("../../blog/entities/blog.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const event_entity_1 = require("../../events/entities/event.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const tag_entity_1 = require("../../tags/entities/tag.entity");
const type_entity_1 = require("../../types/entities/type.entity");
const typeorm_1 = require("typeorm");
let Region = class Region {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, shops: { required: true, type: () => [require("../../shops/entities/shop.entity").Shop] }, products: { required: true, type: () => [require("../../products/entities/product.entity").Product] }, types: { required: true, type: () => [require("../../types/entities/type.entity").Type] }, categories: { required: true, type: () => [require("../../categories/entities/category.entity").Category] }, subCategories: { required: true, type: () => [require("../../categories/entities/category.entity").SubCategory] }, tags: { required: true, type: () => [require("../../tags/entities/tag.entity").Tag] }, events: { required: true, type: () => [require("../../events/entities/event.entity").Event] }, blogs: { required: true, type: () => [require("../../blog/entities/blog.entity").Blog] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Region.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Region.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => shop_entity_1.Shop, (shop) => shop.regions, { onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinTable)({
        name: 'shop_regions',
        joinColumn: { name: 'regionId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'shopId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Region.prototype, "shops", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, (product) => product.regions),
    __metadata("design:type", Array)
], Region.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => type_entity_1.Type, (type) => type.regions),
    __metadata("design:type", Array)
], Region.prototype, "types", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.Category, (category) => category.regions),
    __metadata("design:type", Array)
], Region.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.SubCategory, (subCategory) => subCategory.regions),
    __metadata("design:type", Array)
], Region.prototype, "subCategories", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => tag_entity_1.Tag, (tag) => tag.regions),
    __metadata("design:type", Array)
], Region.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_entity_1.Event, (event) => event.region, { nullable: true }),
    __metadata("design:type", Array)
], Region.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => blog_entity_1.Blog, (blog) => blog.region, { nullable: true }),
    __metadata("design:type", Array)
], Region.prototype, "blogs", void 0);
Region = __decorate([
    (0, typeorm_1.Entity)()
], Region);
exports.Region = Region;
//# sourceMappingURL=region.entity.js.map
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
exports.PaymentInfo = exports.Shop = void 0;
const openapi = require("@nestjs/swagger");
const address_entity_1 = require("../../address/entities/address.entity");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const core_entity_1 = require("../../common/entities/core.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const balance_entity_1 = require("./balance.entity");
const shopSettings_entity_1 = require("./shopSettings.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const permission_entity_1 = require("../../permission/entities/permission.entity");
const region_entity_1 = require("../../region/entities/region.entity");
const event_entity_1 = require("../../events/entities/event.entity");
let Shop = class Shop extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, owner_id: { required: true, type: () => Number }, owner: { required: true, type: () => require("../../users/entities/user.entity").User }, staffs: { required: false, type: () => [require("../../users/entities/user.entity").User] }, is_active: { required: true, type: () => Boolean }, orders_count: { required: true, type: () => Number }, products_count: { required: true, type: () => Number }, balance: { required: false, type: () => require("./balance.entity").Balance }, products: { required: false, type: () => [require("../../products/entities/product.entity").Product] }, name: { required: true, type: () => String }, slug: { required: true, type: () => String }, description: { required: false, type: () => String }, cover_image: { required: false, type: () => [require("../../common/entities/attachment.entity").Attachment] }, logo: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, address: { required: false, type: () => require("../../address/entities/address.entity").UserAdd }, settings: { required: false, type: () => require("./shopSettings.entity").ShopSettings }, gst_number: { required: false, type: () => String }, categories: { required: true, type: () => [require("../../categories/entities/category.entity").Category] }, subCategories: { required: true, type: () => [require("../../categories/entities/category.entity").SubCategory] }, orders: { required: true, type: () => [require("../../orders/entities/order.entity").Order] }, permission: { required: false, type: () => require("../../permission/entities/permission.entity").Permission }, additionalPermissions: { required: true, type: () => [require("../../permission/entities/permission.entity").Permission] }, dealerCount: { required: true, type: () => Number }, events: { required: true, type: () => [require("../../events/entities/event.entity").Event] }, regions: { required: true, type: () => [require("../../region/entities/region.entity").Region] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Shop.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Shop.prototype, "owner_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.owned_shops, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], Shop.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.managed_shop, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Shop.prototype, "staffs", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Shop.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Shop.prototype, "orders_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Shop.prototype, "products_count", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => balance_entity_1.Balance, (balance) => balance.shop, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", balance_entity_1.Balance)
], Shop.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, (product) => product.shop, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Shop.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Shop.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Shop.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Shop.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => attachment_entity_1.Attachment, { cascade: true, eager: true }),
    (0, typeorm_1.JoinTable)({
        name: 'shop_cover_image',
        joinColumn: { name: 'shopId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Shop.prototype, "cover_image", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => attachment_entity_1.Attachment, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], Shop.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.UserAdd, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", address_entity_1.UserAdd)
], Shop.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => shopSettings_entity_1.ShopSettings, { cascade: true, nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", shopSettings_entity_1.ShopSettings)
], Shop.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Shop.prototype, "gst_number", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => category_entity_1.Category, (category) => category.shop, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Shop.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => category_entity_1.SubCategory, (subCategory) => subCategory.shop, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Shop.prototype, "subCategories", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => order_entity_1.Order, (order) => order.shop, { nullable: true, onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Shop.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.Permission, (permission) => permission.shop, { onDelete: "CASCADE", eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'permission_id' }),
    __metadata("design:type", permission_entity_1.Permission)
], Shop.prototype, "permission", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => permission_entity_1.Permission, (permission) => permission.shops, { onDelete: "CASCADE", eager: true }),
    (0, typeorm_1.JoinTable)({ name: 'shop_additional_permission' }),
    __metadata("design:type", Array)
], Shop.prototype, "additionalPermissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Shop.prototype, "dealerCount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_entity_1.Event, (event) => event.shop, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], Shop.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => region_entity_1.Region, (region) => region.shops, { onDelete: "CASCADE", eager: true }),
    __metadata("design:type", Array)
], Shop.prototype, "regions", void 0);
Shop = __decorate([
    (0, typeorm_1.Entity)()
], Shop);
exports.Shop = Shop;
let PaymentInfo = class PaymentInfo {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, account: { required: true, type: () => String }, name: { required: true, type: () => String }, email: { required: true, type: () => String }, bank: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentInfo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentInfo.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentInfo.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentInfo.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentInfo.prototype, "bank", void 0);
PaymentInfo = __decorate([
    (0, typeorm_1.Entity)()
], PaymentInfo);
exports.PaymentInfo = PaymentInfo;
//# sourceMappingURL=shop.entity.js.map
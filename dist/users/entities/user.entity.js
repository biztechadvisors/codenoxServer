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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserType = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const profile_entity_1 = require("./profile.entity");
const typeorm_1 = require("typeorm");
const dealer_entity_1 = require("./dealer.entity");
const permission_entity_1 = require("../../permission/entities/permission.entity");
const stocks_entity_1 = require("../../stocks/entities/stocks.entity");
const stocksOrd_entity_1 = require("../../stocks/entities/stocksOrd.entity");
const notifications_entity_1 = require("../../notifications/entities/notifications.entity");
const address_entity_1 = require("../../address/entities/address.entity");
var UserType;
(function (UserType) {
    UserType["Super_Admin"] = "Super_Admin";
    UserType["Admin"] = "Admin";
    UserType["Dealer"] = "Dealer";
    UserType["Vendor"] = "Vendor";
    UserType["Company"] = "Company";
    UserType["Customer"] = "Customer";
    UserType["Owner"] = "Owner";
    UserType["Staff"] = "Staff";
})(UserType = exports.UserType || (exports.UserType = {}));
let User = User_1 = class User extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, email: { required: true, type: () => String }, password: { required: false, type: () => String }, otp: { required: true, type: () => Number }, isVerified: { required: true, type: () => Boolean }, shop_id: { required: false, type: () => Number }, profile: { required: false, type: () => require("./profile.entity").Profile }, dealer: { required: false, type: () => require("./dealer.entity").Dealer }, createdBy: { required: false, type: () => require("./user.entity").User }, createdUsers: { required: false, type: () => [require("./user.entity").User] }, owned_shops: { required: false, type: () => [require("../../shops/entities/shop.entity").Shop] }, notifications: { required: true, type: () => [require("../../notifications/entities/notifications.entity").Notification] }, managed_shop: { required: false, type: () => require("../../shops/entities/shop.entity").Shop }, inventoryStocks: { required: false, type: () => [require("../../stocks/entities/stocks.entity").InventoryStocks] }, stocks: { required: false, type: () => [require("../../stocks/entities/stocks.entity").Stocks] }, is_active: { required: true, type: () => Boolean }, adds: { required: true, type: () => [require("../../address/entities/address.entity").Add] }, orders: { required: true, type: () => [require("../../orders/entities/order.entity").Order] }, stockOrd: { required: true, type: () => [require("../../stocks/entities/stocksOrd.entity").StocksSellOrd] }, stocksSellOrd: { required: true, type: () => [require("../../stocks/entities/stocksOrd.entity").StocksSellOrd] }, permission: { required: true, type: () => require("../../permission/entities/permission.entity").Permission }, walletPoints: { required: true, type: () => Number }, contact: { required: true, type: () => String }, email_verified_at: { required: true, type: () => Date } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => profile_entity_1.Profile, profile => profile.customer, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", profile_entity_1.Profile)
], User.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => dealer_entity_1.Dealer, (dealer) => dealer.user, { onDelete: 'CASCADE', onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", dealer_entity_1.Dealer)
], User.prototype, "dealer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1, (user) => user.createdUsers, { onDelete: 'CASCADE' }),
    __metadata("design:type", User)
], User.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => User_1, (user) => user.createdBy, { onDelete: "SET NULL" }),
    __metadata("design:type", Array)
], User.prototype, "createdUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => shop_entity_1.Shop, shop => shop.owner, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "owned_shops", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notifications_entity_1.Notification, (notification) => notification.user, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop, shop => shop.staffs, {
        onDelete: "SET NULL",
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'shop_id' }),
    __metadata("design:type", shop_entity_1.Shop)
], User.prototype, "managed_shop", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocks_entity_1.InventoryStocks, inventoryStocks => inventoryStocks.user, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "inventoryStocks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocks_entity_1.Stocks, stocks => stocks.user, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "stocks", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => address_entity_1.Add, (add) => add.customer, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "adds", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.customer, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocksOrd_entity_1.StocksSellOrd, stocksSellOrd => stocksSellOrd.soldBy, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "stockOrd", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocksOrd_entity_1.StocksSellOrd, stocksSellOrd => stocksSellOrd.customer, { onDelete: "CASCADE" }),
    __metadata("design:type", Array)
], User.prototype, "stocksSellOrd", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.Permission, {
        nullable: true
    }),
    (0, typeorm_1.JoinColumn)({ name: 'permission_id' }),
    __metadata("design:type", permission_entity_1.Permission)
], User.prototype, "permission", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "walletPoints", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 200, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.Column)('datetime', { nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "email_verified_at", void 0);
User = User_1 = __decorate([
    (0, typeorm_1.Entity)()
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map
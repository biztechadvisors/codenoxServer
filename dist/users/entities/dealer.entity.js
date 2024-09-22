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
exports.DealerCategoryMargin = exports.DealerProductMargin = exports.Dealer = exports.SubscriptionType = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const user_entity_1 = require("./user.entity");
const balance_entity_1 = require("../../shops/entities/balance.entity");
var SubscriptionType;
(function (SubscriptionType) {
    SubscriptionType["SILVER"] = "silver";
    SubscriptionType["GOLD"] = "gold";
    SubscriptionType["PLATINUM"] = "platinum";
})(SubscriptionType = exports.SubscriptionType || (exports.SubscriptionType = {}));
let Dealer = class Dealer {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, user: { required: true, type: () => require("./user.entity").User }, phone: { required: true, type: () => Number }, name: { required: true, type: () => String }, subscriptionType: { required: true, enum: require("./dealer.entity").SubscriptionType }, subscriptionStart: { required: true, type: () => Date }, subscriptionEnd: { required: true, type: () => Date }, discount: { required: true, type: () => Number }, walletBalance: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean }, dealerProductMargins: { required: true, type: () => [require("./dealer.entity").DealerProductMargin] }, dealerCategoryMargins: { required: true, type: () => [require("./dealer.entity").DealerCategoryMargin] }, balance: { required: true, type: () => [require("../../shops/entities/balance.entity").Balance] }, gst: { required: true, type: () => String }, pan: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Dealer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.dealer, { onDelete: "SET NULL", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Dealer.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Dealer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Dealer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SubscriptionType }),
    __metadata("design:type", String)
], Dealer.prototype, "subscriptionType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Dealer.prototype, "subscriptionStart", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Dealer.prototype, "subscriptionEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Dealer.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Dealer.prototype, "walletBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Dealer.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DealerProductMargin, dealerProductMargin => dealerProductMargin.dealer, { cascade: true }),
    __metadata("design:type", Array)
], Dealer.prototype, "dealerProductMargins", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DealerCategoryMargin, dealerCategoryMargin => dealerCategoryMargin.dealer, { cascade: true }),
    __metadata("design:type", Array)
], Dealer.prototype, "dealerCategoryMargins", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => balance_entity_1.Balance, balance => balance.dealer, { cascade: true }),
    __metadata("design:type", Array)
], Dealer.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Dealer.prototype, "gst", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Dealer.prototype, "pan", void 0);
Dealer = __decorate([
    (0, typeorm_1.Entity)()
], Dealer);
exports.Dealer = Dealer;
let DealerProductMargin = class DealerProductMargin {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, dealer: { required: true, type: () => require("./dealer.entity").Dealer }, product: { required: true, type: () => require("../../products/entities/product.entity").Product }, margin: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DealerProductMargin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Dealer, dealer => dealer.dealerProductMargins),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Dealer)
], DealerProductMargin.prototype, "dealer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", product_entity_1.Product)
], DealerProductMargin.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], DealerProductMargin.prototype, "margin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DealerProductMargin.prototype, "isActive", void 0);
DealerProductMargin = __decorate([
    (0, typeorm_1.Entity)()
], DealerProductMargin);
exports.DealerProductMargin = DealerProductMargin;
let DealerCategoryMargin = class DealerCategoryMargin {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, dealer: { required: true, type: () => require("./dealer.entity").Dealer }, category: { required: true, type: () => require("../../categories/entities/category.entity").Category }, margin: { required: true, type: () => Number }, isActive: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DealerCategoryMargin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Dealer, dealer => dealer.dealerCategoryMargins),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Dealer)
], DealerCategoryMargin.prototype, "dealer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", category_entity_1.Category)
], DealerCategoryMargin.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], DealerCategoryMargin.prototype, "margin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DealerCategoryMargin.prototype, "isActive", void 0);
DealerCategoryMargin = __decorate([
    (0, typeorm_1.Entity)()
], DealerCategoryMargin);
exports.DealerCategoryMargin = DealerCategoryMargin;
//# sourceMappingURL=dealer.entity.js.map
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
exports.StocksSellOrd = void 0;
const openapi = require("@nestjs/swagger");
const address_entity_1 = require("../../address/entities/address.entity");
const core_entity_1 = require("../../common/entities/core.entity");
const coupon_entity_1 = require("../../coupons/entities/coupon.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const order_entity_1 = require("../../orders/entities/order.entity");
const order_status_entity_1 = require("../../orders/entities/order-status.entity");
let StocksSellOrd = class StocksSellOrd extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, tracking_number: { required: true, type: () => String }, customer_id: { required: true, type: () => Number }, customer_contact: { required: true, type: () => String }, status: { required: true, type: () => require("../../orders/entities/order-status.entity").OrderStatus }, coupon: { required: false, type: () => require("../../coupons/entities/coupon.entity").Coupon }, order_status: { required: true, enum: require("../../orders/entities/order.entity").OrderStatusType }, payment_status: { required: true, enum: require("../../orders/entities/order.entity").PaymentStatusType }, amount: { required: true, type: () => Number }, sales_tax: { required: true, type: () => Number }, total: { required: true, type: () => Number }, paid_total: { required: true, type: () => Number }, payment_id: { required: false, type: () => String }, payment_gateway: { required: true, type: () => String }, discount: { required: false, type: () => Number }, delivery_fee: { required: true, type: () => Number }, delivery_time: { required: true, type: () => String }, products: { required: true, type: () => [require("../../products/entities/product.entity").Product] }, soldBy: { required: true, type: () => require("../../users/entities/user.entity").User }, billing_address: { required: true, type: () => require("../../address/entities/address.entity").UserAdd }, shipping_address: { required: true, type: () => require("../../address/entities/address.entity").UserAdd }, language: { required: true, type: () => String }, translated_languages: { required: true, type: () => [String] }, customerId: { required: true, type: () => Number }, logistics_provider: { required: true, type: () => Object }, soldByUserAddress: { required: true, type: () => require("../../address/entities/address.entity").UserAdd }, cancelled_amount: { required: true, type: () => Number }, wallet_point: { required: true, type: () => Number }, customer: { required: true, type: () => require("../../users/entities/user.entity").User } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "tracking_number", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "customer_contact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_status_entity_1.OrderStatus, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", order_status_entity_1.OrderStatus)
], StocksSellOrd.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coupon_entity_1.Coupon, coupon => coupon.stockOrders),
    __metadata("design:type", coupon_entity_1.Coupon)
], StocksSellOrd.prototype, "coupon", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "order_status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "sales_tax", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "paid_total", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "payment_gateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "delivery_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "delivery_time", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, product => product.stocksSellOrders),
    (0, typeorm_1.JoinTable)({ name: "stocks_sell_Order_products" }),
    __metadata("design:type", Array)
], StocksSellOrd.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.stockOrd),
    __metadata("design:type", user_entity_1.User)
], StocksSellOrd.prototype, "soldBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.UserAdd, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    __metadata("design:type", address_entity_1.UserAdd)
], StocksSellOrd.prototype, "billing_address", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.UserAdd, { onDelete: "CASCADE", onUpdate: "CASCADE" }),
    __metadata("design:type", address_entity_1.UserAdd)
], StocksSellOrd.prototype, "shipping_address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StocksSellOrd.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Array)
], StocksSellOrd.prototype, "translated_languages", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], StocksSellOrd.prototype, "logistics_provider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.UserAdd, { onDelete: "CASCADE" }),
    __metadata("design:type", address_entity_1.UserAdd)
], StocksSellOrd.prototype, "soldByUserAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "cancelled_amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StocksSellOrd.prototype, "wallet_point", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.stocksSellOrd),
    __metadata("design:type", user_entity_1.User)
], StocksSellOrd.prototype, "customer", void 0);
StocksSellOrd = __decorate([
    (0, typeorm_1.Entity)()
], StocksSellOrd);
exports.StocksSellOrd = StocksSellOrd;
//# sourceMappingURL=stocksOrd.entity.js.map
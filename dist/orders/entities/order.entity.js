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
var Order_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderFiles = exports.Order = exports.PaymentStatusType = exports.OrderStatusType = exports.PaymentGatewayType = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const coupon_entity_1 = require("../../coupons/entities/coupon.entity");
const payment_intent_entity_1 = require("../../payment-intent/entries/payment-intent.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const order_status_entity_1 = require("./order-status.entity");
const typeorm_1 = require("typeorm");
const stocks_entity_1 = require("../../stocks/entities/stocks.entity");
const address_entity_1 = require("../../address/entities/address.entity");
var PaymentGatewayType;
(function (PaymentGatewayType) {
    PaymentGatewayType["STRIPE"] = "STRIPE";
    PaymentGatewayType["CASH_ON_DELIVERY"] = "CASH_ON_DELIVERY";
    PaymentGatewayType["CASH"] = "CASH";
    PaymentGatewayType["FULL_WALLET_PAYMENT"] = "FULL_WALLET_PAYMENT";
    PaymentGatewayType["PAYPAL"] = "PAYPAL";
    PaymentGatewayType["RAZORPAY"] = "RAZORPAY";
})(PaymentGatewayType = exports.PaymentGatewayType || (exports.PaymentGatewayType = {}));
var OrderStatusType;
(function (OrderStatusType) {
    OrderStatusType["PENDING"] = "order-pending";
    OrderStatusType["PROCESSING"] = "order-processing";
    OrderStatusType["COMPLETED"] = "order-completed";
    OrderStatusType["CANCELLED"] = "order-cancelled";
    OrderStatusType["REFUNDED"] = "order-refunded";
    OrderStatusType["FAILED"] = "order-failed";
    OrderStatusType["AT_LOCAL_FACILITY"] = "order-at-local-facility";
    OrderStatusType["OUT_FOR_DELIVERY"] = "order-out-for-delivery";
    OrderStatusType["DEFAULT_ORDER_STATUS"] = "order-pending";
})(OrderStatusType = exports.OrderStatusType || (exports.OrderStatusType = {}));
var PaymentStatusType;
(function (PaymentStatusType) {
    PaymentStatusType["PENDING"] = "payment-pending";
    PaymentStatusType["PROCESSING"] = "payment-processing";
    PaymentStatusType["SUCCESS"] = "payment-success";
    PaymentStatusType["FAILED"] = "payment-failed";
    PaymentStatusType["REVERSAL"] = "payment-reversal";
    PaymentStatusType["CASH_ON_DELIVERY"] = "payment-cash-on-delivery";
    PaymentStatusType["CASH"] = "payment-cash";
    PaymentStatusType["WALLET"] = "payment-wallet";
    PaymentStatusType["AWAITING_FOR_APPROVAL"] = "payment-awaiting-for-approval";
    PaymentStatusType["DEFAULT_PAYMENT_STATUS"] = "payment-pending";
    PaymentStatusType["PAID"] = "PAID";
})(PaymentStatusType = exports.PaymentStatusType || (exports.PaymentStatusType = {}));
let Order = Order_1 = class Order extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, tracking_number: { required: true, type: () => String }, customer_id: { required: false, type: () => Number }, customer_contact: { required: true, type: () => String }, customer: { required: true, type: () => require("../../users/entities/user.entity").User }, parentOrder: { required: true, type: () => require("./order.entity").Order }, children: { required: false, type: () => [require("./order.entity").Order] }, status: { required: true, type: () => require("./order-status.entity").OrderStatus }, order_status: { required: true, enum: require("./order.entity").OrderStatusType }, payment_status: { required: true, enum: require("./order.entity").PaymentStatusType }, amount: { required: true, type: () => Number }, sales_tax: { required: true, type: () => Number }, total: { required: true, type: () => Number }, paid_total: { required: true, type: () => Number }, payment_id: { required: false, type: () => String }, payment_gateway: { required: true, enum: require("./order.entity").PaymentGatewayType }, coupon: { required: false, type: () => require("../../coupons/entities/coupon.entity").Coupon }, shop_id: { required: true, type: () => Number }, shop: { required: true, type: () => [require("../../shops/entities/shop.entity").Shop] }, discount: { required: false, type: () => Number }, delivery_fee: { required: true, type: () => Number }, delivery_time: { required: true, type: () => String }, products: { required: true, type: () => [require("../../products/entities/product.entity").Product] }, orderProductPivots: { required: true, type: () => [require("../../products/entities/product.entity").OrderProductPivot] }, billing_address: { required: true, type: () => require("../../address/entities/address.entity").UserAdd }, shipping_address: { required: true, type: () => require("../../address/entities/address.entity").UserAdd }, language: { required: true, type: () => String }, translated_languages: { required: true, type: () => [Object], nullable: true }, payment_intent: { required: true, type: () => require("../../payment-intent/entries/payment-intent.entity").PaymentIntent }, altered_payment_gateway: { required: false, type: () => String }, logistics_provider: { required: true, type: () => String }, soldByUserAddress: { required: true, type: () => require("../../address/entities/address.entity").UserAdd }, cancelled_amount: { required: true, type: () => Number }, wallet_point: { required: true, type: () => Number }, dealer: { required: true, type: () => require("../../users/entities/user.entity").User }, stocks: { required: true, type: () => [require("../../stocks/entities/stocks.entity").Stocks] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "tracking_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "customer_contact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.orders, { cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", user_entity_1.User)
], Order.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1, (order) => order.children, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parentOrderId' }),
    __metadata("design:type", Order)
], Order.prototype, "parentOrder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Order_1, (order) => order.parentOrder),
    __metadata("design:type", Array)
], Order.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => order_status_entity_1.OrderStatus, (orderStatus) => orderStatus.order, { nullable: true, cascade: ['insert', 'update'] }),
    (0, typeorm_1.JoinColumn)({ name: 'statusId' }),
    __metadata("design:type", order_status_entity_1.OrderStatus)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "order_status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "sales_tax", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Order.prototype, "paid_total", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "payment_gateway", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => coupon_entity_1.Coupon, (coupon) => coupon.orders, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'coupon_id' }),
    __metadata("design:type", coupon_entity_1.Coupon)
], Order.prototype, "coupon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Order.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => shop_entity_1.Shop, (shop) => shop.orders, { cascade: ['insert', 'update'] }),
    (0, typeorm_1.JoinTable)({ name: 'shop_order' }),
    __metadata("design:type", Array)
], Order.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "delivery_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "delivery_time", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, product => product.orders, { cascade: true }),
    (0, typeorm_1.JoinTable)({
        name: 'order_product',
        joinColumn: { name: 'order_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Order.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.OrderProductPivot, (pivot) => pivot.order, { cascade: ['insert', 'update'] }),
    __metadata("design:type", Array)
], Order.prototype, "orderProductPivots", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.UserAdd, { nullable: false, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'billingAddressId' }),
    __metadata("design:type", address_entity_1.UserAdd)
], Order.prototype, "billing_address", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.UserAdd, { nullable: false, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'shippingAddressId' }),
    __metadata("design:type", address_entity_1.UserAdd)
], Order.prototype, "shipping_address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Order.prototype, "translated_languages", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => payment_intent_entity_1.PaymentIntent, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'paymentIntentId' }),
    __metadata("design:type", payment_intent_entity_1.PaymentIntent)
], Order.prototype, "payment_intent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "altered_payment_gateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "logistics_provider", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => address_entity_1.UserAdd, { cascade: true }),
    __metadata("design:type", address_entity_1.UserAdd)
], Order.prototype, "soldByUserAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "cancelled_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Order.prototype, "wallet_point", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'dealerId' }),
    __metadata("design:type", user_entity_1.User)
], Order.prototype, "dealer", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocks_entity_1.Stocks, (stocks) => stocks.order),
    __metadata("design:type", Array)
], Order.prototype, "stocks", void 0);
Order = Order_1 = __decorate([
    (0, typeorm_1.Entity)()
], Order);
exports.Order = Order;
let OrderFiles = class OrderFiles extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, purchase_key: { required: true, type: () => String }, digital_file_id: { required: true, type: () => Number }, order_id: { required: false, type: () => Number }, customer_id: { required: true, type: () => Number }, file: { required: true, type: () => require("../../products/entities/product.entity").File }, fileable: { required: true, type: () => require("../../products/entities/product.entity").Product } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderFiles.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OrderFiles.prototype, "purchase_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], OrderFiles.prototype, "digital_file_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], OrderFiles.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], OrderFiles.prototype, "customer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.File, { nullable: true, cascade: true }),
    __metadata("design:type", product_entity_1.File)
], OrderFiles.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, { nullable: true, cascade: true }),
    __metadata("design:type", product_entity_1.Product)
], OrderFiles.prototype, "fileable", void 0);
OrderFiles = __decorate([
    (0, typeorm_1.Entity)()
], OrderFiles);
exports.OrderFiles = OrderFiles;
//# sourceMappingURL=order.entity.js.map
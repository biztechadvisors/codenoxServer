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
exports.CreateOrderDto = exports.CardInput = exports.ConnectProductOrderPivot = exports.UserAddressInput = void 0;
const openapi = require("@nestjs/swagger");
const payment_intent_entity_1 = require("../../payment-intent/entries/payment-intent.entity");
const order_entity_1 = require("../entities/order.entity");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class UserAddressInput {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, street_address: { required: true, type: () => String }, country: { required: true, type: () => String }, city: { required: true, type: () => String }, state: { required: true, type: () => String }, zip: { required: true, type: () => String } };
    }
}
exports.UserAddressInput = UserAddressInput;
class ConnectProductOrderPivot {
    static _OPENAPI_METADATA_FACTORY() {
        return { product_id: { required: true, type: () => Number }, variation_option_id: { required: false, type: () => Number }, order_quantity: { required: true, type: () => Number }, unit_price: { required: true, type: () => Number }, subtotal: { required: true, type: () => Number }, quantity: { required: true, type: () => Object } };
    }
}
exports.ConnectProductOrderPivot = ConnectProductOrderPivot;
class CardInput {
    static _OPENAPI_METADATA_FACTORY() {
        return { number: { required: true, type: () => String }, expiryMonth: { required: true, type: () => String }, expiryYear: { required: true, type: () => String }, cvv: { required: true, type: () => String }, email: { required: false, type: () => String } };
    }
}
exports.CardInput = CardInput;
class CreateOrderDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { soldByUserAddress: { required: false, type: () => require("./create-order.dto").UserAddressInput }, shop_id: { required: false, type: () => Number }, coupon_id: { required: false, type: () => Number }, status: { required: true, type: () => String }, customerId: { required: false, type: () => Number }, customer_contact: { required: true, type: () => String }, products: { required: true, type: () => [require("./create-order.dto").ConnectProductOrderPivot] }, amount: { required: true, type: () => Number }, sales_tax: { required: true, type: () => Number }, total: { required: false, type: () => Number }, paid_total: { required: false, type: () => Number }, payment_id: { required: false, type: () => String }, payment_gateway: { required: true, enum: require("../entities/order.entity").PaymentGatewayType }, discount: { required: false, type: () => Number }, delivery_fee: { required: false, type: () => Number }, delivery_time: { required: true, type: () => String }, card: { required: false, type: () => require("./create-order.dto").CardInput }, billing_address: { required: false, type: () => require("./create-order.dto").UserAddressInput }, shipping_address: { required: false, type: () => require("./create-order.dto").UserAddressInput }, payment_intent: { required: false, type: () => require("../../payment-intent/entries/payment-intent.entity").PaymentIntent }, language: { required: false, type: () => String }, translated_languages: { required: false, type: () => [String] }, dealerId: { required: false, type: () => Number } };
    }
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserAddressInput),
    __metadata("design:type", UserAddressInput)
], CreateOrderDto.prototype, "soldByUserAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "shop_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "coupon_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customer_contact", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConnectProductOrderPivot),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "products", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "sales_tax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "paid_total", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "payment_id", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(order_entity_1.PaymentGatewayType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "payment_gateway", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "discount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "delivery_fee", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "delivery_time", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CardInput),
    __metadata("design:type", CardInput)
], CreateOrderDto.prototype, "card", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserAddressInput),
    __metadata("design:type", UserAddressInput)
], CreateOrderDto.prototype, "billing_address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserAddressInput),
    __metadata("design:type", UserAddressInput)
], CreateOrderDto.prototype, "shipping_address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => payment_intent_entity_1.PaymentIntent),
    __metadata("design:type", payment_intent_entity_1.PaymentIntent)
], CreateOrderDto.prototype, "payment_intent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "translated_languages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOrderDto.prototype, "dealerId", void 0);
exports.CreateOrderDto = CreateOrderDto;
//# sourceMappingURL=create-order.dto.js.map
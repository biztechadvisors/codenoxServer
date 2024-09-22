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
exports.PaymentIntent = exports.PaymentIntentInfo = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let PaymentIntentInfo = class PaymentIntentInfo {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, client_secret: { required: false, type: () => String, nullable: true }, redirect_url: { required: false, type: () => String, nullable: true }, payment_id: { required: true, type: () => String }, order_id: { required: true, type: () => String }, is_redirect: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentIntentInfo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentIntentInfo.prototype, "client_secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PaymentIntentInfo.prototype, "redirect_url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentIntentInfo.prototype, "payment_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentIntentInfo.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], PaymentIntentInfo.prototype, "is_redirect", void 0);
PaymentIntentInfo = __decorate([
    (0, typeorm_1.Entity)()
], PaymentIntentInfo);
exports.PaymentIntentInfo = PaymentIntentInfo;
let PaymentIntent = class PaymentIntent {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, order_id: { required: true, type: () => Number }, tracking_number: { required: true, type: () => String }, payment_gateway: { required: true, type: () => String }, payment_intent_info: { required: false, type: () => require("./payment-intent.entity").PaymentIntentInfo } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentIntent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PaymentIntent.prototype, "order_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentIntent.prototype, "tracking_number", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentIntent.prototype, "payment_gateway", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PaymentIntentInfo, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'payment_intent_info_id' }),
    __metadata("design:type", PaymentIntentInfo)
], PaymentIntent.prototype, "payment_intent_info", void 0);
PaymentIntent = __decorate([
    (0, typeorm_1.Entity)()
], PaymentIntent);
exports.PaymentIntent = PaymentIntent;
//# sourceMappingURL=payment-intent.entity.js.map
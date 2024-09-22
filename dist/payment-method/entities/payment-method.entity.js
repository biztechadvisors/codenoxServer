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
exports.PaymentMethod = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const core_entity_1 = require("../../common/entities/core.entity");
const payment_gateway_entity_1 = require("./payment-gateway.entity");
const typeorm_1 = require("typeorm");
let PaymentMethod = class PaymentMethod extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, method_key: { required: true, type: () => String }, default_card: { required: true, type: () => Boolean }, payment_gateway_id: { required: false, type: () => Number }, fingerprint: { required: false, type: () => String }, owner_name: { required: false, type: () => String }, network: { required: false, type: () => String }, type: { required: false, type: () => String }, last4: { required: false, type: () => String }, expires: { required: false, type: () => String }, origin: { required: false, type: () => String }, verification_check: { required: false, type: () => String }, payment_gateways: { required: false, type: () => require("./payment-gateway.entity").PaymentGateWay } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentMethod.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "method_key", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PaymentMethod.prototype, "default_card", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PaymentMethod.prototype, "payment_gateway_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "fingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "owner_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "network", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "last4", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "expires", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "origin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentMethod.prototype, "verification_check", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_gateway_entity_1.PaymentGateWay),
    __metadata("design:type", payment_gateway_entity_1.PaymentGateWay)
], PaymentMethod.prototype, "payment_gateways", void 0);
PaymentMethod = __decorate([
    (0, typeorm_1.Entity)()
], PaymentMethod);
exports.PaymentMethod = PaymentMethod;
//# sourceMappingURL=payment-method.entity.js.map
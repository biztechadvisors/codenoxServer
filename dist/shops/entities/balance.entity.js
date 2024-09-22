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
exports.Balance = void 0;
const openapi = require("@nestjs/swagger");
const dealer_entity_1 = require("../../users/entities/dealer.entity");
const typeorm_1 = require("typeorm");
const shop_entity_1 = require("./shop.entity");
let Balance = class Balance {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, admin_commission_rate: { required: true, type: () => Number }, shop: { required: true, type: () => require("./shop.entity").Shop }, dealer: { required: true, type: () => require("../../users/entities/dealer.entity").Dealer }, total_earnings: { required: true, type: () => Number }, withdrawn_amount: { required: true, type: () => Number }, current_balance: { required: true, type: () => Number }, payment_info: { required: false, type: () => require("./shop.entity").PaymentInfo } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Balance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Balance.prototype, "admin_commission_rate", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => shop_entity_1.Shop, (shop) => shop.balance),
    __metadata("design:type", shop_entity_1.Shop)
], Balance.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dealer_entity_1.Dealer, (dealer) => dealer.balance, { onDelete: "SET NULL", nullable: true }),
    __metadata("design:type", dealer_entity_1.Dealer)
], Balance.prototype, "dealer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Balance.prototype, "total_earnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Balance.prototype, "withdrawn_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Balance.prototype, "current_balance", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => shop_entity_1.PaymentInfo, { onDelete: "CASCADE", nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", shop_entity_1.PaymentInfo)
], Balance.prototype, "payment_info", void 0);
Balance = __decorate([
    (0, typeorm_1.Entity)()
], Balance);
exports.Balance = Balance;
//# sourceMappingURL=balance.entity.js.map
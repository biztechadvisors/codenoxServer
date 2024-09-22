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
exports.WithdrawStatus = exports.Withdraw = void 0;
const openapi = require("@nestjs/swagger");
const core_entity_1 = require("../../common/entities/core.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const typeorm_1 = require("typeorm");
let Withdraw = class Withdraw extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, amount: { required: true, type: () => Number }, status: { required: true, enum: require("./withdraw.entity").WithdrawStatus }, shop_id: { required: true, type: () => Number }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop }, payment_method: { required: true, type: () => String }, details: { required: true, type: () => String }, note: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Withdraw.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Withdraw.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Withdraw.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Withdraw.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shop_entity_1.Shop),
    __metadata("design:type", shop_entity_1.Shop)
], Withdraw.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Withdraw.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Withdraw.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Withdraw.prototype, "note", void 0);
Withdraw = __decorate([
    (0, typeorm_1.Entity)()
], Withdraw);
exports.Withdraw = Withdraw;
var WithdrawStatus;
(function (WithdrawStatus) {
    WithdrawStatus["APPROVED"] = "Approved";
    WithdrawStatus["PENDING"] = "Pending";
    WithdrawStatus["ON_HOLD"] = "On hold";
    WithdrawStatus["REJECTED"] = "Rejected";
    WithdrawStatus["PROCESSING"] = "Processing";
})(WithdrawStatus = exports.WithdrawStatus || (exports.WithdrawStatus = {}));
//# sourceMappingURL=withdraw.entity.js.map
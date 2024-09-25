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
exports.Analytics = exports.TotalYearSaleByMonth = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const core_entity_1 = require("../../common/entities/core.entity");
let TotalYearSaleByMonth = class TotalYearSaleByMonth extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, total: { required: true, type: () => Number }, month: { required: true, type: () => String }, analytics: { required: true, type: () => [require("./analytics.entity").Analytics] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TotalYearSaleByMonth.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], TotalYearSaleByMonth.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], TotalYearSaleByMonth.prototype, "month", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Analytics, (analytics) => analytics.totalYearSaleByMonth, {
        onDelete: 'CASCADE',
        eager: false,
    }),
    __metadata("design:type", Array)
], TotalYearSaleByMonth.prototype, "analytics", void 0);
TotalYearSaleByMonth = __decorate([
    (0, typeorm_1.Entity)('total_year_sale_by_month')
], TotalYearSaleByMonth);
exports.TotalYearSaleByMonth = TotalYearSaleByMonth;
let Analytics = class Analytics extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, totalRevenue: { required: false, type: () => Number }, totalOrders: { required: true, type: () => Number }, user_id: { required: true, type: () => Number }, shop_id: { required: true, type: () => Number }, todaysRevenue: { required: false, type: () => Number }, totalRefunds: { required: false, type: () => Number }, totalShops: { required: true, type: () => Number }, totalDealers: { required: true, type: () => Number }, newCustomers: { required: true, type: () => Number }, totalYearSaleByMonth: { required: false, type: () => [require("./analytics.entity").TotalYearSaleByMonth] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Analytics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Analytics.prototype, "totalRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Analytics.prototype, "totalOrders", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Analytics.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Analytics.prototype, "shop_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Analytics.prototype, "todaysRevenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Analytics.prototype, "totalRefunds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Analytics.prototype, "totalShops", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Analytics.prototype, "totalDealers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Analytics.prototype, "newCustomers", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => TotalYearSaleByMonth, (totalYearSaleByMonth) => totalYearSaleByMonth.analytics, {
        eager: true,
        cascade: true,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinTable)({ name: 'analytics_total_year_sale_by_month' }),
    __metadata("design:type", Array)
], Analytics.prototype, "totalYearSaleByMonth", void 0);
Analytics = __decorate([
    (0, typeorm_1.Entity)('analytics')
], Analytics);
exports.Analytics = Analytics;
//# sourceMappingURL=analytics.entity.js.map
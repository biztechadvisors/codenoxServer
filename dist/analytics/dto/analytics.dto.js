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
exports.GetAnalyticsDto = exports.TopUsersQueryDto = exports.AnalyticsResponseDTO = exports.TotalYearSaleByMonthDTO = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TotalYearSaleByMonthDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { total: { required: true, type: () => Number }, month: { required: true, type: () => String } };
    }
}
exports.TotalYearSaleByMonthDTO = TotalYearSaleByMonthDTO;
class AnalyticsResponseDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { totalRevenue: { required: true, type: () => Number }, totalRefunds: { required: true, type: () => Number }, totalShops: { required: true, type: () => Number }, todaysRevenue: { required: true, type: () => Number }, totalOrders: { required: true, type: () => Number }, newCustomers: { required: true, type: () => Number }, totalYearSaleByMonth: { required: true, type: () => [require("./analytics.dto").TotalYearSaleByMonthDTO] } };
    }
}
exports.AnalyticsResponseDTO = AnalyticsResponseDTO;
class TopUsersQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => Number } };
    }
}
exports.TopUsersQueryDto = TopUsersQueryDto;
class GetAnalyticsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { shop_id: { required: false, type: () => Number }, customerId: { required: false, type: () => Number }, state: { required: true, type: () => String }, startDate: { required: false, type: () => String }, endDate: { required: false, type: () => String } };
    }
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GetAnalyticsDto.prototype, "shop_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GetAnalyticsDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetAnalyticsDto.prototype, "endDate", void 0);
exports.GetAnalyticsDto = GetAnalyticsDto;
//# sourceMappingURL=analytics.dto.js.map
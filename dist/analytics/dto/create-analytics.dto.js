"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAnalyticsDto = exports.CreateTotalYearSaleByMonthDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateTotalYearSaleByMonthDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { total: { required: true, type: () => Number }, month: { required: true, type: () => String } };
    }
}
exports.CreateTotalYearSaleByMonthDto = CreateTotalYearSaleByMonthDto;
class CreateAnalyticsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { analyticsData: { required: true, type: () => Object }, saleData: { required: true, type: () => [require("./create-analytics.dto").CreateTotalYearSaleByMonthDto] } };
    }
}
exports.CreateAnalyticsDto = CreateAnalyticsDto;
//# sourceMappingURL=create-analytics.dto.js.map
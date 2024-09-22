"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopUsersQueryDto = exports.GetAnalyticsDto = exports.AnalyticsResponseDTO = exports.TotalYearSaleByMonthDTO = void 0;
const openapi = require("@nestjs/swagger");
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
class GetAnalyticsDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { shop_id: { required: true, type: () => Number }, customerId: { required: true, type: () => Number }, state: { required: true, type: () => String } };
    }
}
exports.GetAnalyticsDto = GetAnalyticsDto;
class TopUsersQueryDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => Number } };
    }
}
exports.TopUsersQueryDto = TopUsersQueryDto;
//# sourceMappingURL=analytics.dto.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AnalyticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const analytics_dto_1 = require("./dto/analytics.dto");
const swagger_1 = require("@nestjs/swagger");
let AnalyticsController = AnalyticsController_1 = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
        this.logger = new common_1.Logger(AnalyticsController_1.name);
    }
    async getAnalytics(query) {
        try {
            this.logger.log(`Fetching analytics for shop_id: ${query.shop_id}, customerId: ${query.customerId}, state: ${query.state}`);
            const result = await this.analyticsService.findAll(query.shop_id, query.customerId, query.state);
            if (!result) {
                throw new common_1.NotFoundException('No analytics data found');
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error fetching analytics:', error.message);
            if (error instanceof common_1.NotFoundException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Error fetching analytics data');
        }
    }
    async getTopCustomers(query) {
        try {
            this.logger.log(`Fetching top customers for userId: ${query.userId}`);
            const result = await this.analyticsService.getTopUsersWithMaxOrders(+query.userId);
            if (!result || result.length === 0) {
                throw new common_1.NotFoundException('No top customers found');
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error fetching top customers:', error.message);
            throw new common_1.BadRequestException('Error fetching top customers');
        }
    }
    async getTopDealer(query) {
        try {
            this.logger.log(`Fetching top dealers for userId: ${query.userId}`);
            const result = await this.analyticsService.getTopDealer(+query.userId);
            if (!result || result.length === 0) {
                throw new common_1.NotFoundException('No top dealers found');
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error fetching top dealers:', error.message);
            throw new common_1.BadRequestException('Error fetching top dealers');
        }
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch analytics for a specific shop, customer, and state' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.GetAnalyticsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Get)('top-customers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top customers based on the number of orders' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.TopUsersQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopCustomers", null);
__decorate([
    (0, common_1.Get)('top-dealers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top dealers' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_dto_1.TopUsersQueryDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTopDealer", null);
AnalyticsController = AnalyticsController_1 = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map
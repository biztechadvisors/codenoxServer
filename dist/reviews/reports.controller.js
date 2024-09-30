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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbusiveReportsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const create_report_dto_1 = require("./dto/create-report.dto");
const update_report_dto_1 = require("./dto/update-report.dto");
const reports_service_1 = require("./reports.service");
const cacheService_1 = require("../helpers/cacheService");
let AbusiveReportsController = class AbusiveReportsController {
    constructor(reportService, cacheService) {
        this.reportService = reportService;
        this.cacheService = cacheService;
    }
    async findAll(shopSlug, userId, page = 1, limit = 10) {
        return this.reportService.findAllReports(shopSlug, userId, page, limit);
    }
    find(id) {
        return this.reportService.findReport(id);
    }
    async create(createReportDto) {
        await this.cacheService.invalidateCacheBySubstring('abusive_reports');
        return this.reportService.create(createReportDto);
    }
    async update(id, updateReportDto) {
        await this.cacheService.invalidateCacheBySubstring('abusive_reports');
        return this.reportService.update(+id, updateReportDto);
    }
    async delete(id) {
        await this.cacheService.invalidateCacheBySubstring('abusive_reports');
        return this.reportService.delete(+id);
    }
};
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: require("../reports/dto/get-reports.dto").MyReportPaginator }),
    __param(0, (0, common_1.Query)('shopSlug')),
    __param(1, (0, common_1.Query)('userId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], AbusiveReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/reports.entity").Report }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AbusiveReportsController.prototype, "find", null);
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/reports.entity").Report }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_report_dto_1.CreateReportDto]),
    __metadata("design:returntype", Promise)
], AbusiveReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/reports.entity").Report }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_report_dto_1.UpdateReportDto]),
    __metadata("design:returntype", Promise)
], AbusiveReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbusiveReportsController.prototype, "delete", null);
AbusiveReportsController = __decorate([
    (0, common_1.Controller)('abusive_reports'),
    __metadata("design:paramtypes", [reports_service_1.AbusiveReportService, cacheService_1.CacheService])
], AbusiveReportsController);
exports.AbusiveReportsController = AbusiveReportsController;
//# sourceMappingURL=reports.controller.js.map
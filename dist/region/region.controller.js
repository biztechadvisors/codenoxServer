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
exports.RegionController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const create_region_dto_1 = require("./dto/create-region.dto");
const region_service_1 = require("./region.service");
const cacheService_1 = require("../helpers/cacheService");
let RegionController = class RegionController {
    constructor(regionService, cacheService) {
        this.regionService = regionService;
        this.cacheService = cacheService;
    }
    async create(createRegionDto) {
        await this.cacheService.invalidateCacheBySubstring('regions');
        return this.regionService.createRegion(createRegionDto);
    }
    async findAllRegionByShop(shopSlug) {
        return this.regionService.findAllRegionByShop(shopSlug);
    }
    async findOne(id) {
        return this.regionService.findOne(id);
    }
    async update(id, updateRegionDto) {
        await this.cacheService.invalidateCacheBySubstring('regions');
        return this.regionService.update(id, updateRegionDto);
    }
    async remove(id) {
        await this.cacheService.invalidateCacheBySubstring('regions');
        return this.regionService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/region.entity").Region }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_region_dto_1.CreateRegionDto]),
    __metadata("design:returntype", Promise)
], RegionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('shop/:shopSlug'),
    openapi.ApiResponse({ status: 200, type: [require("./entities/region.entity").Region] }),
    __param(0, (0, common_1.Param)('shopSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegionController.prototype, "findAllRegionByShop", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/region.entity").Region }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RegionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/region.entity").Region }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_region_dto_1.UpdateRegionDto]),
    __metadata("design:returntype", Promise)
], RegionController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RegionController.prototype, "remove", null);
RegionController = __decorate([
    (0, common_1.Controller)('regions'),
    __metadata("design:paramtypes", [region_service_1.RegionService, cacheService_1.CacheService])
], RegionController);
exports.RegionController = RegionController;
//# sourceMappingURL=region.controller.js.map
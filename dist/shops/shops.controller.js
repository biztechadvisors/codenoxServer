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
exports.DisapproveShopController = exports.ApproveShopController = exports.StaffsController = exports.ShopsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const shops_service_1 = require("./shops.service");
const create_shop_dto_1 = require("./dto/create-shop.dto");
const update_shop_dto_1 = require("./dto/update-shop.dto");
const get_shops_dto_1 = require("./dto/get-shops.dto");
const get_staffs_dto_1 = require("./dto/get-staffs.dto");
const cacheService_1 = require("../helpers/cacheService");
let ShopsController = class ShopsController {
    constructor(shopsService, cacheService) {
        this.shopsService = shopsService;
        this.cacheService = cacheService;
    }
    async create(createShopDto) {
        await this.cacheService.invalidateCacheBySubstring('shops');
        return this.shopsService.create(createShopDto);
    }
    async getShops(query) {
        return this.shopsService.getShops(query);
    }
    async getShop(slug) {
        return this.shopsService.getShop(slug);
    }
    async update(id, updateShopDto) {
        await this.cacheService.invalidateCacheBySubstring('shops');
        return this.shopsService.update(id, updateShopDto);
    }
    async remove(id) {
        await this.cacheService.invalidateCacheBySubstring('shops');
        return this.shopsService.remove(id);
    }
    async approve(id) {
        return this.shopsService.changeShopStatus(id, true);
    }
    async disapprove(id) {
        return this.shopsService.changeShopStatus(id, false);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/shop.entity").Shop }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shop_dto_1.CreateShopDto]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: require("./dto/get-shops.dto").ShopPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_shops_dto_1.GetShopsDto]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getShops", null);
__decorate([
    (0, common_1.Get)(':slug'),
    openapi.ApiResponse({ status: 200, type: require("./entities/shop.entity").Shop }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "getShop", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/shop.entity").Shop }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_shop_dto_1.UpdateShopDto]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('approve/:id'),
    openapi.ApiResponse({ status: 201, type: require("./entities/shop.entity").Shop }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('disapprove/:id'),
    openapi.ApiResponse({ status: 201, type: require("./entities/shop.entity").Shop }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ShopsController.prototype, "disapprove", null);
ShopsController = __decorate([
    (0, common_1.Controller)('shops'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService,
        cacheService_1.CacheService])
], ShopsController);
exports.ShopsController = ShopsController;
let StaffsController = class StaffsController {
    constructor(shopsService) {
        this.shopsService = shopsService;
    }
    async getStaffs(query) {
        return this.shopsService.getStaffs(query);
    }
};
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: require("../users/dto/get-users.dto").UserPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_staffs_dto_1.GetStaffsDto]),
    __metadata("design:returntype", Promise)
], StaffsController.prototype, "getStaffs", null);
StaffsController = __decorate([
    (0, common_1.Controller)('staffs'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService])
], StaffsController);
exports.StaffsController = StaffsController;
let ApproveShopController = class ApproveShopController {
    constructor(shopsService) {
        this.shopsService = shopsService;
    }
    async approveShop(approveShopDto) {
        return this.shopsService.approveShop(approveShopDto);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/shop.entity").Shop }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shop_dto_1.ApproveShopDto]),
    __metadata("design:returntype", Promise)
], ApproveShopController.prototype, "approveShop", null);
ApproveShopController = __decorate([
    (0, common_1.Controller)('approve-shop'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService])
], ApproveShopController);
exports.ApproveShopController = ApproveShopController;
let DisapproveShopController = class DisapproveShopController {
    constructor(shopsService) {
        this.shopsService = shopsService;
    }
    async disapproveShop(id) {
        return this.shopsService.disapproveShop(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/shop.entity").Shop }),
    __param(0, (0, common_1.Body)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DisapproveShopController.prototype, "disapproveShop", null);
DisapproveShopController = __decorate([
    (0, common_1.Controller)('disapprove-shop'),
    __metadata("design:paramtypes", [shops_service_1.ShopsService])
], DisapproveShopController);
exports.DisapproveShopController = DisapproveShopController;
//# sourceMappingURL=shops.controller.js.map
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
exports.GetInspiredController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const get_inspired_service_1 = require("./get-inspired.service");
const create_get_inspired_dto_1 = require("./dto/create-get-inspired.dto");
let GetInspiredController = class GetInspiredController {
    constructor(getInspiredService) {
        this.getInspiredService = getInspiredService;
    }
    createGetInspired(createGetInspiredDto) {
        return this.getInspiredService.createGetInspired(createGetInspiredDto);
    }
    async getAllGetInspired(shopSlug, type, tagIds, page = 1, limit = 10) {
        const tagIdsArray = tagIds ? tagIds.split(',').map(id => parseInt(id, 10)) : [];
        return this.getInspiredService.getAllGetInspired(shopSlug, type, tagIdsArray, page, limit);
    }
    getGetInspiredById(id) {
        return this.getInspiredService.getGetInspiredById(id);
    }
    updateGetInspired(id, updateGetInspiredDto) {
        return this.getInspiredService.updateGetInspired(id, updateGetInspiredDto);
    }
    deleteGetInspired(id) {
        return this.getInspiredService.deleteGetInspired(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/get-inspired.entity").GetInspired }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_get_inspired_dto_1.CreateGetInspiredDto]),
    __metadata("design:returntype", Promise)
], GetInspiredController.prototype, "createGetInspired", null);
__decorate([
    (0, common_1.Get)('shop'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('shopSlug')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('tagIds')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], GetInspiredController.prototype, "getAllGetInspired", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/get-inspired.entity").GetInspired }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GetInspiredController.prototype, "getGetInspiredById", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/get-inspired.entity").GetInspired }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_get_inspired_dto_1.UpdateGetInspiredDto]),
    __metadata("design:returntype", Promise)
], GetInspiredController.prototype, "updateGetInspired", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GetInspiredController.prototype, "deleteGetInspired", null);
GetInspiredController = __decorate([
    (0, common_1.Controller)('get-inspired'),
    __metadata("design:paramtypes", [get_inspired_service_1.GetInspiredService])
], GetInspiredController);
exports.GetInspiredController = GetInspiredController;
//# sourceMappingURL=get-inspired.controller.js.map
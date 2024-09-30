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
exports.AttributesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const attributes_service_1 = require("./attributes.service");
const create_attribute_dto_1 = require("./dto/create-attribute.dto");
const update_attribute_dto_1 = require("./dto/update-attribute.dto");
const get_attribute_dto_1 = require("./dto/get-attribute.dto");
const get_attributes_dto_1 = require("./dto/get-attributes.dto");
const cacheService_1 = require("../helpers/cacheService");
let AttributesController = class AttributesController {
    constructor(attributesService, cacheService) {
        this.attributesService = attributesService;
        this.cacheService = cacheService;
    }
    async create(createAttributeDto) {
        await this.cacheService.invalidateCacheBySubstring("attributes");
        return this.attributesService.create(createAttributeDto);
    }
    findAll(query) {
        return this.attributesService.findAll(query);
    }
    async findOne(param) {
        const attribute = await this.attributesService.findOne(param);
        return attribute;
    }
    async update(id, updateAttributeDto) {
        await this.cacheService.invalidateCacheBySubstring("attributes");
        return this.attributesService.update(+id, updateAttributeDto);
    }
    async delete(id) {
        await this.attributesService.delete(id);
        await this.cacheService.invalidateCacheBySubstring("attributes");
        await this.cacheService.invalidateCacheBySubstring("attributes");
        return { message: 'Attribute deleted successfully', status: true };
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attribute_dto_1.CreateAttributeDto]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_attributes_dto_1.GetAttributesArgs]),
    __metadata("design:returntype", void 0)
], AttributesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_attribute_dto_1.GetAttributeArgs]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_attribute_dto_1.UpdateAttributeDto]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttributesController.prototype, "delete", null);
AttributesController = __decorate([
    (0, common_1.Controller)('attributes'),
    __metadata("design:paramtypes", [attributes_service_1.AttributesService,
        cacheService_1.CacheService])
], AttributesController);
exports.AttributesController = AttributesController;
//# sourceMappingURL=attributes.controller.js.map
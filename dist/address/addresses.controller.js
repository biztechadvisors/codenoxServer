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
exports.AddressesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const addresses_service_1 = require("./addresses.service");
const create_address_dto_1 = require("./dto/create-address.dto");
const update_address_dto_1 = require("./dto/update-address.dto");
const cacheService_1 = require("../helpers/cacheService");
let AddressesController = class AddressesController {
    constructor(addressesService, cacheService) {
        this.addressesService = addressesService;
        this.cacheService = cacheService;
    }
    async createAddress(createAddressDto) {
        await this.cacheService.invalidateCacheBySubstring("address");
        return this.addressesService.create(createAddressDto);
    }
    addresses(userId) {
        return this.addressesService.findAll(userId);
    }
    async address(id) {
        return this.addressesService.findOne(+id);
    }
    async updateAddress(id, updateAddressDto) {
        await this.cacheService.invalidateCacheBySubstring("address");
        return this.addressesService.update(+id, updateAddressDto);
    }
    async deleteAddress(id) {
        await this.cacheService.invalidateCacheBySubstring("address");
        return this.addressesService.remove(+id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/address.entity").Add }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_address_dto_1.CreateAddressDto]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "createAddress", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: [require("./entities/address.entity").Add] }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AddressesController.prototype, "addresses", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/address.entity").Add }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "address", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/address.entity").Add }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_address_dto_1.UpdateAddressDto]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AddressesController.prototype, "deleteAddress", null);
AddressesController = __decorate([
    (0, common_1.Controller)('address'),
    __metadata("design:paramtypes", [addresses_service_1.AddressesService,
        cacheService_1.CacheService])
], AddressesController);
exports.AddressesController = AddressesController;
//# sourceMappingURL=addresses.controller.js.map
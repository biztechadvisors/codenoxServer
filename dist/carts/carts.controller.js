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
exports.AbandonedCartController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const carts_service_1 = require("./carts.service");
const create_cart_dto_1 = require("./dto/create-cart.dto");
const get_cart_dto_1 = require("./dto/get-cart.dto");
const delete_cart_dto_1 = require("./dto/delete-cart.dto");
let AbandonedCartController = class AbandonedCartController {
    constructor(abandonedCartService) {
        this.abandonedCartService = abandonedCartService;
    }
    async create(createCartDto) {
        const data = await this.abandonedCartService.create(createCartDto);
        return data;
    }
    async getAbandonedCartCount(param) {
        const retrive = await this.abandonedCartService.getCartData(param);
        return retrive;
    }
    async removeProductFromCart(itemId, query) {
        return await this.abandonedCartService.delete(itemId, query);
    }
    async clearCart(clearCartDto) {
        const message = await this.abandonedCartService.clearCart(clearCartDto.email);
        return { success: true, message: message };
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/cart.entity").Cart }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cart_dto_1.CreateCartDto]),
    __metadata("design:returntype", Promise)
], AbandonedCartController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/:email'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_cart_dto_1.GetCartData]),
    __metadata("design:returntype", Promise)
], AbandonedCartController.prototype, "getAbandonedCartCount", null);
__decorate([
    (0, common_1.Delete)(':itemId/:quantity/:email'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AbandonedCartController.prototype, "removeProductFromCart", null);
__decorate([
    (0, common_1.Put)(':clearCart'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_cart_dto_1.ClearCartDto]),
    __metadata("design:returntype", Promise)
], AbandonedCartController.prototype, "clearCart", null);
AbandonedCartController = __decorate([
    (0, common_1.Controller)('carts'),
    __metadata("design:paramtypes", [carts_service_1.AbandonedCartService])
], AbandonedCartController);
exports.AbandonedCartController = AbandonedCartController;
//# sourceMappingURL=carts.controller.js.map
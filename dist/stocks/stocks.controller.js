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
exports.StocksController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const stocks_service_1 = require("./stocks.service");
const get_orders_dto_1 = require("../orders/dto/get-orders.dto");
const create_order_status_dto_1 = require("../orders/dto/create-order-status.dto");
const cacheService_1 = require("../helpers/cacheService");
let StocksController = class StocksController {
    constructor(stocksService, cacheService) {
        this.stocksService = stocksService;
        this.cacheService = cacheService;
    }
    async createStock(createStocksDto) {
        await this.cacheService.invalidateCacheBySubstring('stocks');
        return this.stocksService.create(createStocksDto);
    }
    async getAllUserStocks(id) {
        return this.stocksService.getAllStocks(id);
    }
    async getStockByUserAndOrder(userId, orderId) {
        return await this.stocksService.getAll(parseInt(userId), parseInt(orderId));
    }
    async getDealerInventoryStocks(userId) {
        try {
            const stocks = await this.stocksService.getDealerInventoryStocks(userId);
            return stocks;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Error fetching inventory stocks for user ID ${userId}: ${error.message}`);
        }
    }
    async updateStocksByAdmin(user_id, updateStkQuantityDto) {
        try {
            await this.stocksService.updateStocksbyAdmin(+user_id, updateStkQuantityDto);
            await this.cacheService.invalidateCacheBySubstring('stocks');
            return { message: 'Quantity updated successfully' };
        }
        catch (err) {
            return { error: err.message || 'Internal Server Error' };
        }
    }
    async updateInventoryStocksByDealer(user_id, updateStkQuantityDto) {
        try {
            await this.stocksService.updateInventoryStocksByDealer(+user_id, updateStkQuantityDto);
            await this.cacheService.invalidateCacheBySubstring('stocks');
            return { message: 'Quantity updated successfully' };
        }
        catch (err) {
            return { error: err.message || 'Internal Server Error' };
        }
    }
    async afterOrder(createOrderDto) {
        return this.stocksService.afterORD(createOrderDto);
    }
    async orderFromStocks(createOrderDto) {
        await this.stocksService.OrdfromStocks(createOrderDto);
        await this.cacheService.invalidateCacheBySubstring('stocks/orders');
        return await this.stocksService.afterORD(createOrderDto);
    }
    async getOrders(query) {
        return this.stocksService.getOrders(query);
    }
    getOrderById(id) {
        const parsedId = Number(id);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Invalid ID');
        }
        return this.stocksService.getOrderById(parsedId);
    }
    updateOrderStatus(id, updateOrderStatusDto) {
        return this.stocksService.updateOrderStatus(id, updateOrderStatusDto);
    }
    updatePaymentStatus(id, updatePaymentStatusDto) {
        return this.stocksService.updatePaymentStatus(id, updatePaymentStatusDto);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: [require("./entities/stocks.entity").Stocks] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "createStock", null);
__decorate([
    (0, common_1.Get)('user/:id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "getAllUserStocks", null);
__decorate([
    (0, common_1.Get)('user/:user_id/order/:order_id'),
    openapi.ApiResponse({ status: 200, type: [require("./entities/stocks.entity").Stocks] }),
    __param(0, (0, common_1.Param)('user_id')),
    __param(1, (0, common_1.Param)('order_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "getStockByUserAndOrder", null);
__decorate([
    (0, common_1.Get)('inventory/:userId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "getDealerInventoryStocks", null);
__decorate([
    (0, common_1.Put)('update/admin/:user_id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('user_id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "updateStocksByAdmin", null);
__decorate([
    (0, common_1.Put)('update/inventory/:user_id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('user_id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "updateInventoryStocksByDealer", null);
__decorate([
    (0, common_1.Put)('after-order'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "afterOrder", null);
__decorate([
    (0, common_1.Post)('order'),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "orderFromStocks", null);
__decorate([
    (0, common_1.Get)('orders'),
    openapi.ApiResponse({ status: 200, type: require("../orders/dto/get-orders.dto").OrderPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_orders_dto_1.GetOrdersDto]),
    __metadata("design:returntype", Promise)
], StocksController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('order/:id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    openapi.ApiResponse({ status: 200, type: require("./entities/stocksOrd.entity").StocksSellOrd }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Patch)(':id/payment-status'),
    openapi.ApiResponse({ status: 200, type: require("./entities/stocksOrd.entity").StocksSellOrd }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], StocksController.prototype, "updatePaymentStatus", null);
StocksController = __decorate([
    (0, common_1.Controller)('stocks'),
    __metadata("design:paramtypes", [stocks_service_1.StocksService,
        cacheService_1.CacheService])
], StocksController);
exports.StocksController = StocksController;
//# sourceMappingURL=stocks.controller.js.map
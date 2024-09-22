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
var OrdersController_1, OrderStatusController_1, OrderExportController_1, DownloadInvoiceController_1, ShiprocketController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiprocketController = exports.DownloadInvoiceController = exports.OrderExportController = exports.OrderFilesController = exports.OrderStatusController = exports.OrdersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const create_order_status_dto_1 = require("./dto/create-order-status.dto");
const create_order_dto_1 = require("./dto/create-order.dto");
const get_downloads_dto_1 = require("./dto/get-downloads.dto");
const get_order_statuses_dto_1 = require("./dto/get-order-statuses.dto");
const get_orders_dto_1 = require("./dto/get-orders.dto");
const order_payment_dto_1 = require("./dto/order-payment.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const verify_checkout_dto_1 = require("./dto/verify-checkout.dto");
const order_entity_1 = require("./entities/order.entity");
const orders_service_1 = require("./orders.service");
const shiprocket_service_1 = require("./shiprocket.service");
const common_2 = require("@nestjs/common");
let OrdersController = OrdersController_1 = class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_2.Logger(OrdersController_1.name);
    }
    async create(createOrderDto) {
        try {
            const OrdSuccess = await this.ordersService.create(createOrderDto);
            await this.ordersService.updateOrderQuantityProducts(createOrderDto.products);
            return OrdSuccess;
        }
        catch (error) {
            this.logger.error('Error creating order:', error.message || error);
            throw new common_1.BadRequestException('Failed to create order');
        }
    }
    async getOrders(query) {
        return this.ordersService.getOrders(query);
    }
    async getOrderById(id) {
        const order = await this.ordersService.getOrderByIdOrTrackingNumber(id);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async update(id, updateOrderDto) {
        return this.ordersService.update(id, updateOrderDto);
    }
    async remove(id) {
        return this.ordersService.remove(id);
    }
    async verifyCheckout(body) {
        return this.ordersService.verifyCheckout(body);
    }
    async submitPayment(orderPaymentDto) {
        const { tracking_number, paymentIntentInfo } = orderPaymentDto;
        const order = await this.ordersService.getOrderByIdOrTrackingNumber(tracking_number);
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        switch (order.payment_gateway.toString().toLowerCase()) {
            case 'stripe':
                await this.ordersService.stripePay(order);
                break;
            case 'paypal':
                await this.ordersService.paypalPay(order);
                break;
            case 'razorpay':
                const paymentSuccessful = await this.ordersService.razorpayPay(order, paymentIntentInfo);
                if (paymentSuccessful) {
                    await this.ordersService.changeOrderPaymentStatus(order, order_entity_1.PaymentStatusType.SUCCESS);
                }
                break;
            default:
                throw new common_1.BadRequestException('Invalid payment gateway');
        }
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200, type: require("./dto/get-orders.dto").OrderPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_orders_dto_1.GetOrdersDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200, type: require("./entities/order.entity").Order }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('checkout/verify'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 201, type: require("./dto/verify-checkout.dto").VerifiedCheckoutData }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_checkout_dto_1.CheckoutVerificationDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "verifyCheckout", null);
__decorate([
    (0, common_1.Post)('/payment'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_payment_dto_1.OrderPaymentDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "submitPayment", null);
OrdersController = OrdersController_1 = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
exports.OrdersController = OrdersController;
let OrderStatusController = OrderStatusController_1 = class OrderStatusController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_2.Logger(OrderStatusController_1.name);
    }
    async create(createOrderStatusDto) {
        return this.ordersService.createOrderStatus(createOrderStatusDto);
    }
    async findAll(query) {
        return this.ordersService.getOrderStatuses(query);
    }
    async findOne(param, language) {
        return this.ordersService.getOrderStatus(param, language);
    }
    async update(id, updateOrderStatusDto) {
        return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
    }
    async remove(id) {
        return this.ordersService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 201, type: require("./entities/order-status.entity").OrderStatus }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_status_dto_1.CreateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrderStatusController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200, type: require("./dto/get-order-statuses.dto").OrderStatusPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_order_statuses_dto_1.GetOrderStatusesDto]),
    __metadata("design:returntype", Promise)
], OrderStatusController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':param'),
    openapi.ApiResponse({ status: 200, type: require("./entities/order-status.entity").OrderStatus }),
    __param(0, (0, common_1.Param)('param')),
    __param(1, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderStatusController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200, type: require("./entities/order-status.entity").OrderStatus }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_order_status_dto_1.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrderStatusController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrderStatusController.prototype, "remove", null);
OrderStatusController = OrderStatusController_1 = __decorate([
    (0, common_1.Controller)('order-status'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrderStatusController);
exports.OrderStatusController = OrderStatusController;
let OrderFilesController = class OrderFilesController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getOrderFileItems(query) {
        return this.ordersService.getOrderFileItems(query);
    }
    async getDigitalFileDownloadUrl(digitalFileId) {
        return this.ordersService.getDigitalFileDownloadUrl(digitalFileId);
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200, type: require("./dto/get-downloads.dto").OrderFilesPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_downloads_dto_1.GetOrderFilesDto]),
    __metadata("design:returntype", Promise)
], OrderFilesController.prototype, "getOrderFileItems", null);
__decorate([
    (0, common_1.Post)('digital_file'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, common_1.Body)('digital_file_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrderFilesController.prototype, "getDigitalFileDownloadUrl", null);
OrderFilesController = __decorate([
    (0, common_1.Controller)('downloads'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrderFilesController);
exports.OrderFilesController = OrderFilesController;
let OrderExportController = OrderExportController_1 = class OrderExportController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_2.Logger(OrderExportController_1.name);
    }
    async orderExport(shop_id) {
        return this.ordersService.exportOrder(shop_id);
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Query)('shop_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderExportController.prototype, "orderExport", null);
OrderExportController = OrderExportController_1 = __decorate([
    (0, common_1.Controller)('export-order-url'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrderExportController);
exports.OrderExportController = OrderExportController;
let DownloadInvoiceController = DownloadInvoiceController_1 = class DownloadInvoiceController {
    constructor(ordersService) {
        this.ordersService = ordersService;
        this.logger = new common_2.Logger(DownloadInvoiceController_1.name);
    }
    async downloadInvoiceUrl(input) {
        return this.ordersService.downloadInvoiceUrl(input.order_id);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DownloadInvoiceController.prototype, "downloadInvoiceUrl", null);
DownloadInvoiceController = DownloadInvoiceController_1 = __decorate([
    (0, common_1.Controller)('download-invoice-url'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], DownloadInvoiceController);
exports.DownloadInvoiceController = DownloadInvoiceController;
let ShiprocketController = ShiprocketController_1 = class ShiprocketController {
    constructor(shiprocketService) {
        this.shiprocketService = shiprocketService;
        this.logger = new common_2.Logger(ShiprocketController_1.name);
    }
    async deliveryCharge(requestBody) {
        try {
            const { pickup_postcode, delivery_postcode, weight, cod } = requestBody;
            const { partner, shippingDetails } = await this.shiprocketService.calculateShippingCostAndChoosePartner(pickup_postcode, delivery_postcode, weight, cod);
            return {
                partner,
                shippingCost: shippingDetails.shippingCost,
                courierDetails: shippingDetails,
            };
        }
        catch (error) {
            this.logger.error('Error calculating shipping cost and choosing partner:', error.message);
            throw new common_1.BadRequestException('Failed to calculate shipping cost and choose a partner.');
        }
    }
    async deliveryChargeT(requestBody) {
        try {
            const response = await this.shiprocketService.calculateShippingCost(requestBody);
            return response;
        }
        catch (error) {
            this.logger.error('Error calculating shipping cost and choosing partner:', error.message);
            throw new common_1.BadRequestException('Failed to calculate shipping cost and choose a partner.');
        }
    }
};
__decorate([
    (0, common_1.Get)('delivery-charge'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShiprocketController.prototype, "deliveryCharge", null);
__decorate([
    (0, common_1.Post)('shipdelivery-charge'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShiprocketController.prototype, "deliveryChargeT", null);
ShiprocketController = ShiprocketController_1 = __decorate([
    (0, common_1.Controller)('Shiprocket_Service'),
    __metadata("design:paramtypes", [shiprocket_service_1.ShiprocketService])
], ShiprocketController);
exports.ShiprocketController = ShiprocketController;
//# sourceMappingURL=orders.controller.js.map
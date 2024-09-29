"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const payment_module_1 = require("../payment/payment.module");
const orders_controller_1 = require("./orders.controller");
const orders_service_1 = require("./orders.service");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_status_entity_1 = require("./entities/order-status.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const coupon_entity_1 = require("../coupons/entities/coupon.entity");
const payment_intent_entity_1 = require("../payment-intent/entries/payment-intent.entity");
const shiprocket_service_1 = require("./shiprocket.service");
const axios_1 = require("@nestjs/axios");
const mail_service_1 = require("../mail/mail.service");
const shop_entity_1 = require("../shops/entities/shop.entity");
const permission_entity_1 = require("../permission/entities/permission.entity");
const dealer_entity_1 = require("../users/entities/dealer.entity");
const stocks_service_1 = require("../stocks/stocks.service");
const stocks_entity_1 = require("../stocks/entities/stocks.entity");
const stocksOrd_entity_1 = require("../stocks/entities/stocksOrd.entity");
const notifications_service_1 = require("../notifications/services/notifications.service");
const notifications_module_1 = require("../notifications/notifications.module");
const notifications_entity_1 = require("../notifications/entities/notifications.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const address_entity_1 = require("../address/entities/address.entity");
const analytics_service_1 = require("../analytics/analytics.service");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
const refund_entity_1 = require("../refunds/entities/refund.entity");
const cacheService_1 = require("../helpers/cacheService");
let OrdersModule = class OrdersModule {
};
OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            payment_module_1.PaymentModule,
            notifications_module_1.NotificationModule,
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, product_entity_1.OrderProductPivot, address_entity_1.UserAdd, dealer_entity_1.Dealer, order_status_entity_1.OrderStatus, user_entity_1.User, product_entity_1.Product, order_entity_1.OrderFiles, coupon_entity_1.Coupon, payment_intent_entity_1.PaymentIntent, product_entity_1.OrderProductPivot, payment_intent_entity_1.PaymentIntentInfo, shop_entity_1.Shop, permission_entity_1.Permission, stocks_entity_1.Stocks, stocksOrd_entity_1.StocksSellOrd, stocks_entity_1.InventoryStocks, product_entity_1.Variation, notifications_entity_1.Notification, product_entity_1.File, analytics_entity_1.Analytics, permission_entity_1.Permission, stocksOrd_entity_1.StocksSellOrd, analytics_entity_1.TotalYearSaleByMonth, refund_entity_1.Refund]),
            axios_1.HttpModule,
            cache_manager_1.CacheModule.register()
        ],
        controllers: [
            orders_controller_1.OrdersController,
            orders_controller_1.OrderStatusController,
            orders_controller_1.OrderFilesController,
            orders_controller_1.OrderExportController,
            orders_controller_1.DownloadInvoiceController,
            orders_controller_1.ShiprocketController,
        ],
        providers: [orders_service_1.OrdersService, analytics_service_1.AnalyticsService, shiprocket_service_1.ShiprocketService, mail_service_1.MailService, stocks_service_1.StocksService, notifications_service_1.NotificationService, cacheService_1.CacheService],
        exports: [orders_service_1.OrdersService],
    })
], OrdersModule);
exports.OrdersModule = OrdersModule;
//# sourceMappingURL=orders.module.js.map
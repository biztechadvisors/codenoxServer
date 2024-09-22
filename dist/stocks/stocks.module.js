"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StocksModule = void 0;
const common_1 = require("@nestjs/common");
const stocks_controller_1 = require("./stocks.controller");
const typeorm_1 = require("@nestjs/typeorm");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const stocks_entity_1 = require("./entities/stocks.entity");
const stocks_service_1 = require("./stocks.service");
const dealer_entity_1 = require("../users/entities/dealer.entity");
const address_entity_1 = require("../address/entities/address.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const order_status_entity_1 = require("../orders/entities/order-status.entity");
const coupon_entity_1 = require("../coupons/entities/coupon.entity");
const shiprocket_service_1 = require("../orders/shiprocket.service");
const mail_service_1 = require("../mail/mail.service");
const stocksOrd_entity_1 = require("./entities/stocksOrd.entity");
const permission_entity_1 = require("../permission/entities/permission.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const notifications_service_1 = require("../notifications/services/notifications.service");
const notifications_entity_1 = require("../notifications/entities/notifications.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let StocksModule = class StocksModule {
};
StocksModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([attachment_entity_1.Attachment, permission_entity_1.Permission, stocksOrd_entity_1.StocksSellOrd, user_entity_1.User, product_entity_1.Product, order_status_entity_1.OrderStatus, product_entity_1.OrderProductPivot, coupon_entity_1.Coupon, stocks_entity_1.Stocks, dealer_entity_1.Dealer, address_entity_1.UserAdd, shop_entity_1.Shop, stocks_entity_1.InventoryStocks, product_entity_1.Variation, order_entity_1.Order, notifications_entity_1.Notification]),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [
            stocks_controller_1.StocksController,
        ],
        providers: [stocks_service_1.StocksService, shiprocket_service_1.ShiprocketService, mail_service_1.MailService, notifications_service_1.NotificationService],
    })
], StocksModule);
exports.StocksModule = StocksModule;
//# sourceMappingURL=stocks.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const analytics_controller_1 = require("./analytics.controller");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_entity_1 = require("./entities/analytics.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const permission_entity_1 = require("../permission/entities/permission.entity");
const address_entity_1 = require("../address/entities/address.entity");
const jwt_1 = require("@nestjs/jwt");
const stocksOrd_entity_1 = require("../stocks/entities/stocksOrd.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const refund_entity_1 = require("../refunds/entities/refund.entity");
let AnalyticsModule = class AnalyticsModule {
};
AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([address_entity_1.UserAdd, refund_entity_1.Refund, analytics_entity_1.Analytics, analytics_entity_1.TotalYearSaleByMonth, order_entity_1.Order, shop_entity_1.Shop, user_entity_1.User, permission_entity_1.Permission, address_entity_1.UserAdd, stocksOrd_entity_1.StocksSellOrd]),
            jwt_1.JwtModule.register({}),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
exports.AnalyticsModule = AnalyticsModule;
//# sourceMappingURL=analytics.module.js.map
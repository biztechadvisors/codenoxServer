"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundsModule = void 0;
const common_1 = require("@nestjs/common");
const refunds_service_1 = require("./refunds.service");
const refunds_controller_1 = require("./refunds.controller");
const typeorm_1 = require("@nestjs/typeorm");
const refund_entity_1 = require("./entities/refund.entity");
const analytics_service_1 = require("../analytics/analytics.service");
const order_entity_1 = require("../orders/entities/order.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const user_entity_1 = require("../users/entities/user.entity");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
const permission_entity_1 = require("../permission/entities/permission.entity");
const stocksOrd_entity_1 = require("../stocks/entities/stocksOrd.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const cacheService_1 = require("../helpers/cacheService");
let RefundsModule = class RefundsModule {
};
RefundsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([refund_entity_1.Refund, order_entity_1.Order, shop_entity_1.Shop, user_entity_1.User, analytics_entity_1.Analytics, permission_entity_1.Permission, stocksOrd_entity_1.StocksSellOrd, analytics_entity_1.TotalYearSaleByMonth]),
            cache_manager_1.CacheModule.register(),
        ],
        controllers: [refunds_controller_1.RefundsController],
        providers: [refunds_service_1.RefundsService, analytics_service_1.AnalyticsService, cacheService_1.CacheService],
    })
], RefundsModule);
exports.RefundsModule = RefundsModule;
//# sourceMappingURL=refunds.module.js.map
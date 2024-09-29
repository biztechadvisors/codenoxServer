"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopsModule = void 0;
const common_1 = require("@nestjs/common");
const shops_service_1 = require("./shops.service");
const shops_controller_1 = require("./shops.controller");
const typeorm_1 = require("@nestjs/typeorm");
const shop_entity_1 = require("./entities/shop.entity");
const balance_entity_1 = require("./entities/balance.entity");
const address_entity_1 = require("../address/entities/address.entity");
const setting_entity_1 = require("../settings/entities/setting.entity");
const user_entity_1 = require("../users/entities/user.entity");
const shopSettings_entity_1 = require("./entities/shopSettings.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const addresses_service_1 = require("../address/addresses.service");
const permission_entity_1 = require("../permission/entities/permission.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const analytics_service_1 = require("../analytics/analytics.service");
const order_entity_1 = require("../orders/entities/order.entity");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
const stocksOrd_entity_1 = require("../stocks/entities/stocksOrd.entity");
const refund_entity_1 = require("../refunds/entities/refund.entity");
const cacheService_1 = require("../helpers/cacheService");
let ShopsModule = class ShopsModule {
};
ShopsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shop_entity_1.Shop, balance_entity_1.Balance, shop_entity_1.PaymentInfo, address_entity_1.Add, setting_entity_1.Location, setting_entity_1.ShopSocials, user_entity_1.User, shopSettings_entity_1.ShopSettings, attachment_entity_1.Attachment, address_entity_1.UserAdd, permission_entity_1.Permission, order_entity_1.Order, analytics_entity_1.Analytics, permission_entity_1.Permission, stocksOrd_entity_1.StocksSellOrd, analytics_entity_1.TotalYearSaleByMonth, refund_entity_1.Refund]),
            cache_manager_1.CacheModule.register(),
        ],
        controllers: [shops_controller_1.ShopsController, shops_controller_1.StaffsController, shops_controller_1.DisapproveShopController, shops_controller_1.ApproveShopController],
        providers: [shops_service_1.ShopsService, analytics_service_1.AnalyticsService, addresses_service_1.AddressesService, cacheService_1.CacheService],
    })
], ShopsModule);
exports.ShopsModule = ShopsModule;
//# sourceMappingURL=shops.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const profile_entity_1 = require("./entities/profile.entity");
const dealer_entity_1 = require("./entities/dealer.entity");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const auth_service_1 = require("../auth/auth.service");
const mail_service_1 = require("../mail/mail.service");
const permission_entity_1 = require("../permission/entities/permission.entity");
const jwt_strategy_1 = require("../auth/auth-helper/jwt.strategy");
const jwt_1 = require("@nestjs/jwt");
const notifications_module_1 = require("../notifications/notifications.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const session_service_1 = require("../auth/auth-helper/session.service");
const address_entity_1 = require("../address/entities/address.entity");
const addresses_service_1 = require("../address/addresses.service");
const analytics_service_1 = require("../analytics/analytics.service");
const order_entity_1 = require("../orders/entities/order.entity");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
const refund_entity_1 = require("../refunds/entities/refund.entity");
const stocksOrd_entity_1 = require("../stocks/entities/stocksOrd.entity");
const delaerForEnquiry_entity_1 = require("./entities/delaerForEnquiry.entity");
let UsersModule = class UsersModule {
};
UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User, address_entity_1.Add, address_entity_1.UserAdd, profile_entity_1.Profile, dealer_entity_1.Dealer, profile_entity_1.Social, product_entity_1.Product, category_entity_1.Category,
                attachment_entity_1.Attachment, dealer_entity_1.DealerCategoryMargin, dealer_entity_1.DealerProductMargin, shop_entity_1.Shop, permission_entity_1.Permission, order_entity_1.Order, analytics_entity_1.Analytics, refund_entity_1.Refund, stocksOrd_entity_1.StocksSellOrd,
                analytics_entity_1.TotalYearSaleByMonth, delaerForEnquiry_entity_1.DealerEnquiry
            ]),
            jwt_1.JwtModule.register({}),
            cache_manager_1.CacheModule.register(),
            notifications_module_1.NotificationModule,
        ],
        controllers: [users_controller_1.UsersController, users_controller_1.ProfilesController, users_controller_1.DealerController],
        providers: [users_service_1.UsersService, auth_service_1.AuthService, mail_service_1.MailService, addresses_service_1.AddressesService, jwt_strategy_1.JwtStrategy, session_service_1.SessionService, analytics_service_1.AnalyticsService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map
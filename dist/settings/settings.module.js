"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModule = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const settings_controller_1 = require("./settings.controller");
const typeorm_1 = require("@nestjs/typeorm");
const setting_entity_1 = require("./entities/setting.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const cacheService_1 = require("../helpers/cacheService");
let SettingsModule = class SettingsModule {
};
SettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([setting_entity_1.Setting, attachment_entity_1.Attachment, setting_entity_1.PaymentGateway, setting_entity_1.LogoSettings, setting_entity_1.DeliveryTime, setting_entity_1.ServerInfo, setting_entity_1.SeoSettings, setting_entity_1.SmsEvent, setting_entity_1.SmsAdmin, setting_entity_1.SmsVendor, setting_entity_1.SmsCustomer, setting_entity_1.EmailAdmin, setting_entity_1.EmailVendor, setting_entity_1.EmailCustomer, setting_entity_1.EmailEvent, setting_entity_1.CurrencyOptions, setting_entity_1.ShopSocials, setting_entity_1.SettingsOptions, setting_entity_1.ContactDetails, setting_entity_1.Location, shop_entity_1.Shop]),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [settings_controller_1.SettingsController],
        providers: [settings_service_1.SettingsService, cacheService_1.CacheService],
        exports: [settings_service_1.SettingsService],
    })
], SettingsModule);
exports.SettingsModule = SettingsModule;
//# sourceMappingURL=settings.module.js.map
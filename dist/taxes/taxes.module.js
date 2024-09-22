"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxesModule = void 0;
const common_1 = require("@nestjs/common");
const taxes_service_1 = require("./taxes.service");
const taxes_controller_1 = require("./taxes.controller");
const typeorm_1 = require("@nestjs/typeorm");
const tax_entity_1 = require("./entities/tax.entity");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let TaxesModule = class TaxesModule {
};
TaxesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tax_entity_1.Tax, product_entity_1.Product, category_entity_1.Category, shop_entity_1.Shop]),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [taxes_controller_1.TaxesController],
        providers: [taxes_service_1.TaxesService],
    })
], TaxesModule);
exports.TaxesModule = TaxesModule;
//# sourceMappingURL=taxes.module.js.map
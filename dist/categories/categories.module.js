"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("./categories.service");
const categories_controller_1 = require("./categories.controller");
const typeorm_1 = require("@nestjs/typeorm");
const category_entity_1 = require("./entities/category.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const type_entity_1 = require("../types/entities/type.entity");
const cacheService_1 = require("../helpers/cacheService");
let CategoriesModule = class CategoriesModule {
};
CategoriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([category_entity_1.Category, shop_entity_1.Shop, category_entity_1.SubCategory, region_entity_1.Region, attachment_entity_1.Attachment, type_entity_1.Type]),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [categories_controller_1.CategoriesController, categories_controller_1.SubCategoriesController],
        providers: [categories_service_1.CategoriesService, cacheService_1.CacheService],
    })
], CategoriesModule);
exports.CategoriesModule = CategoriesModule;
//# sourceMappingURL=categories.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesModule = void 0;
const common_1 = require("@nestjs/common");
const types_service_1 = require("./types.service");
const types_controller_1 = require("./types.controller");
const typeorm_1 = require("@nestjs/typeorm");
const type_entity_1 = require("./entities/type.entity");
const uploads_service_1 = require("../uploads/uploads.service");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const product_entity_1 = require("../products/entities/product.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
const cacheService_1 = require("../helpers/cacheService");
let TypesModule = class TypesModule {
};
TypesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([type_entity_1.Type, region_entity_1.Region, product_entity_1.Product, type_entity_1.TypeSettings, type_entity_1.Banner, attachment_entity_1.Attachment, shop_entity_1.Shop, tag_entity_1.Tag, category_entity_1.Category]),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [types_controller_1.TypesController],
        providers: [types_service_1.TypesService, uploads_service_1.UploadsService, cacheService_1.CacheService],
    })
], TypesModule);
exports.TypesModule = TypesModule;
//# sourceMappingURL=types.module.js.map
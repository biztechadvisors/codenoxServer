"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributesModule = void 0;
const common_1 = require("@nestjs/common");
const attributes_service_1 = require("./attributes.service");
const attributes_controller_1 = require("./attributes.controller");
const typeorm_1 = require("@nestjs/typeorm");
const attribute_entity_1 = require("./entities/attribute.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const attribute_value_entity_1 = require("./entities/attribute-value.entity");
let AttributesModule = class AttributesModule {
};
AttributesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([attribute_entity_1.Attribute, shop_entity_1.Shop, attribute_value_entity_1.AttributeValue]),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [attributes_controller_1.AttributesController],
        providers: [attributes_service_1.AttributesService],
    })
], AttributesModule);
exports.AttributesModule = AttributesModule;
//# sourceMappingURL=attributes.module.js.map
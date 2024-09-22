"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInspiredModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const get_inspired_entity_1 = require("./entities/get-inspired.entity");
const get_inspired_service_1 = require("./get-inspired.service");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const get_inspired_controller_1 = require("./get-inspired.controller");
const cache_manager_1 = require("@nestjs/cache-manager");
const tag_entity_1 = require("../tags/entities/tag.entity");
let GetInspiredModule = class GetInspiredModule {
};
GetInspiredModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([get_inspired_entity_1.GetInspired, attachment_entity_1.Attachment, shop_entity_1.Shop, tag_entity_1.Tag]),
            cache_manager_1.CacheModule.register()],
        controllers: [get_inspired_controller_1.GetInspiredController],
        providers: [get_inspired_service_1.GetInspiredService],
    })
], GetInspiredModule);
exports.GetInspiredModule = GetInspiredModule;
//# sourceMappingURL=get-inspired.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreNoticesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const addresses_module_1 = require("../address/addresses.module");
const store_notices_entity_1 = require("./entities/store-notices.entity");
const user_entity_1 = require("../users/entities/user.entity");
const address_entity_1 = require("../address/entities/address.entity");
const profile_entity_1 = require("../users/entities/profile.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const dealer_entity_1 = require("../users/entities/dealer.entity");
let StoreNoticesModule = class StoreNoticesModule {
};
StoreNoticesModule = __decorate([
    (0, common_1.Module)({
        imports: [addresses_module_1.AddModule, typeorm_1.TypeOrmModule.forFeature([store_notices_entity_1.StoreNotice, user_entity_1.User, address_entity_1.Add, profile_entity_1.Profile, attachment_entity_1.Attachment, dealer_entity_1.Dealer])],
        providers: [],
    })
], StoreNoticesModule);
exports.StoreNoticesModule = StoreNoticesModule;
//# sourceMappingURL=store-notices.module.js.map
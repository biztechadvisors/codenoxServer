"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistsModule = void 0;
const common_1 = require("@nestjs/common");
const my_wishlists_controller_1 = require("./my-wishlists.controller");
const my_wishlists_service_1 = require("./my-wishlists.service");
const wishlists_controller_1 = require("./wishlists.controller");
const wishlists_service_1 = require("./wishlists.service");
const typeorm_1 = require("@nestjs/typeorm");
const wishlist_entity_1 = require("./entities/wishlist.entity");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../users/entities/user.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const cacheService_1 = require("../helpers/cacheService");
let WishlistsModule = class WishlistsModule {
};
WishlistsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([wishlist_entity_1.Wishlist, product_entity_1.Product, user_entity_1.User]),
            cache_manager_1.CacheModule.register()],
        controllers: [wishlists_controller_1.WishlistsController, my_wishlists_controller_1.MyWishlistsController],
        providers: [wishlists_service_1.WishlistsService, my_wishlists_service_1.MyWishlistService, cacheService_1.CacheService],
    })
], WishlistsModule);
exports.WishlistsModule = WishlistsModule;
//# sourceMappingURL=wishlists.module.js.map
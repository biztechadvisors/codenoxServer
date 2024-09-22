"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const products_controller_1 = require("./products.controller");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("./entities/product.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const type_entity_1 = require("../types/entities/type.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const attribute_value_entity_1 = require("../attributes/entities/attribute-value.entity");
const dealer_entity_1 = require("../users/entities/dealer.entity");
const user_entity_1 = require("../users/entities/user.entity");
const tax_entity_1 = require("../taxes/entities/tax.entity");
const uploadProductsXl_1 = require("./uploadProductsXl");
const cache_manager_1 = require("@nestjs/cache-manager");
const region_entity_1 = require("../region/entities/region.entity");
let ProductsModule = class ProductsModule {
};
ProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                product_entity_1.Product, region_entity_1.Region, product_entity_1.OrderProductPivot, product_entity_1.Variation, product_entity_1.VariationOption, attachment_entity_1.Attachment, category_entity_1.Category, category_entity_1.SubCategory, shop_entity_1.Shop, type_entity_1.Type, tag_entity_1.Tag, attribute_value_entity_1.AttributeValue, product_entity_1.File, dealer_entity_1.Dealer, dealer_entity_1.DealerProductMargin, dealer_entity_1.DealerCategoryMargin, user_entity_1.User, tax_entity_1.Tax
            ]),
            cache_manager_1.CacheModule.register(),
        ],
        controllers: [products_controller_1.ProductsController, products_controller_1.PopularProductsController, products_controller_1.UploadProductsXl],
        providers: [
            products_service_1.ProductsService,
            uploadProductsXl_1.UploadXlService,
        ],
    })
], ProductsModule);
exports.ProductsModule = ProductsModule;
//# sourceMappingURL=products.module.js.map
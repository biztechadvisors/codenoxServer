"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModule = void 0;
const common_1 = require("@nestjs/common");
const reports_controller_1 = require("./reports.controller");
const reports_service_1 = require("./reports.service");
const reviews_controller_1 = require("./reviews.controller");
const reviews_service_1 = require("./reviews.service");
const typeorm_1 = require("@nestjs/typeorm");
const review_entity_1 = require("./entities/review.entity");
const reports_entity_1 = require("./entities/reports.entity");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../users/entities/user.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const feedback_entity_1 = require("../feedbacks/entities/feedback.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const cacheService_1 = require("../helpers/cacheService");
let ReviewModule = class ReviewModule {
};
ReviewModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([review_entity_1.Review, reports_entity_1.Report, product_entity_1.Product, user_entity_1.User, shop_entity_1.Shop, feedback_entity_1.Feedback, order_entity_1.Order]),
            cache_manager_1.CacheModule.register()
        ],
        controllers: [reviews_controller_1.ReviewController, reports_controller_1.AbusiveReportsController],
        providers: [reviews_service_1.ReviewService, reports_service_1.AbusiveReportService, cacheService_1.CacheService],
    })
], ReviewModule);
exports.ReviewModule = ReviewModule;
//# sourceMappingURL=reviews.module.js.map
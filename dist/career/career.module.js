"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CareerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const career_service_1 = require("./career.service");
const career_controller_1 = require("./career.controller");
const career_entity_1 = require("./entities/career.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const vacancies_entity_1 = require("./entities/vacancies.entity");
const address_entity_1 = require("../address/entities/address.entity");
const cacheService_1 = require("../helpers/cacheService");
let CareerModule = class CareerModule {
};
CareerModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([career_entity_1.Career, shop_entity_1.Shop, vacancies_entity_1.Vacancy, address_entity_1.Add]),
            cache_manager_1.CacheModule.register(),
        ],
        providers: [career_service_1.CareerService, cacheService_1.CacheService],
        controllers: [career_controller_1.CareerController, career_controller_1.VacancyController],
    })
], CareerModule);
exports.CareerModule = CareerModule;
//# sourceMappingURL=career.module.js.map
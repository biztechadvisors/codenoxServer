"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VacancyController = exports.CareerController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const career_service_1 = require("./career.service");
const createcareer_dto_1 = require("./dto/createcareer.dto");
const createvacancy_dto_1 = require("./dto/createvacancy.dto");
const cacheService_1 = require("../helpers/cacheService");
let CareerController = class CareerController {
    constructor(careerService, cacheService) {
        this.careerService = careerService;
        this.cacheService = cacheService;
    }
    async create(createCareerDto) {
        await this.cacheService.invalidateCacheBySubstring("careers");
        return this.careerService.createCareer(createCareerDto);
    }
    findAllByShop(shopSlug, location, vacancyTitle, position, page = 1, limit = 10) {
        return this.careerService.findAllByShop(shopSlug, location, vacancyTitle, position, page, limit);
    }
    findOne(id) {
        return this.careerService.getCareerById(id);
    }
    async update(id, updateCareerDto) {
        await this.cacheService.invalidateCacheBySubstring("careers");
        return this.careerService.updateCareer(id, updateCareerDto);
    }
    async remove(id) {
        await this.cacheService.invalidateCacheBySubstring("careers");
        return this.careerService.deleteCareer(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/career.entity").Career }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createcareer_dto_1.CreateCareerDto]),
    __metadata("design:returntype", Promise)
], CareerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('shop/:shopSlug'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('shopSlug')),
    __param(1, (0, common_1.Query)('location')),
    __param(2, (0, common_1.Query)('vacancyTitle')),
    __param(3, (0, common_1.Query)('position')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], CareerController.prototype, "findAllByShop", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/career.entity").Career }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CareerController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/career.entity").Career }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, createcareer_dto_1.UpdateCareerDto]),
    __metadata("design:returntype", Promise)
], CareerController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CareerController.prototype, "remove", null);
CareerController = __decorate([
    (0, common_1.Controller)('careers'),
    __metadata("design:paramtypes", [career_service_1.CareerService, cacheService_1.CacheService])
], CareerController);
exports.CareerController = CareerController;
let VacancyController = class VacancyController {
    constructor(careerService, cacheService) {
        this.careerService = careerService;
        this.cacheService = cacheService;
    }
    async create(createVacancyDto) {
        await this.cacheService.invalidateCacheBySubstring("vacancies");
        return this.careerService.createVacancy(createVacancyDto);
    }
    findOne(id) {
        return this.careerService.findVacancyById(id);
    }
    async update(id, updateVacancyDto) {
        await this.cacheService.invalidateCacheBySubstring("vacancies");
        return this.careerService.updateVacancy(id, updateVacancyDto);
    }
    async remove(id) {
        await this.cacheService.invalidateCacheBySubstring("vacancies");
        return this.careerService.deleteVacancy(id);
    }
    findAll(findVacanciesDto) {
        const { page = 1, limit = 10, city } = findVacanciesDto;
        return this.careerService.findAllVacancies(page, limit, city);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/vacancies.entity").Vacancy }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createvacancy_dto_1.CreateVacancyDto]),
    __metadata("design:returntype", Promise)
], VacancyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/vacancies.entity").Vacancy }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VacancyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/vacancies.entity").Vacancy }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, createvacancy_dto_1.UpdateVacancyDto]),
    __metadata("design:returntype", Promise)
], VacancyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VacancyController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createvacancy_dto_1.FindVacanciesDto]),
    __metadata("design:returntype", Promise)
], VacancyController.prototype, "findAll", null);
VacancyController = __decorate([
    (0, common_1.Controller)('vacancies'),
    __metadata("design:paramtypes", [career_service_1.CareerService, cacheService_1.CacheService])
], VacancyController);
exports.VacancyController = VacancyController;
//# sourceMappingURL=career.controller.js.map
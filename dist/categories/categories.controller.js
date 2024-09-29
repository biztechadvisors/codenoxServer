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
exports.SubCategoriesController = exports.CategoriesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const categories_service_1 = require("./categories.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const get_categories_dto_1 = require("./dto/get-categories.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const cacheService_1 = require("../helpers/cacheService");
let CategoriesController = class CategoriesController {
    constructor(categoriesService, cacheService) {
        this.categoriesService = categoriesService;
        this.cacheService = cacheService;
    }
    async create(createCategoryDto) {
        await this.cacheService.invalidateCacheBySubstring("categories");
        return this.categoriesService.create(createCategoryDto);
    }
    findAll(query) {
        return this.categoriesService.getCategories(query);
    }
    findOne(param, language, shopId) {
        return this.categoriesService.getCategory(param, language, shopId);
    }
    async update(id, updateCategoryDto) {
        await this.cacheService.invalidateCacheBySubstring("categories");
        return this.categoriesService.update(+id, updateCategoryDto);
    }
    async remove(id) {
        await this.cacheService.invalidateCacheBySubstring("categories");
        return this.categoriesService.remove(+id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/category.entity").Category }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: require("./dto/get-categories.dto").CategoryPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_categories_dto_1.GetCategoriesDto]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':param'),
    openapi.ApiResponse({ status: 200, type: require("./entities/category.entity").Category }),
    __param(0, (0, common_1.Param)('param')),
    __param(1, (0, common_1.Query)('language')),
    __param(2, (0, common_1.Query)('shopId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], CategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/category.entity").Category }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "remove", null);
CategoriesController = __decorate([
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService, cacheService_1.CacheService])
], CategoriesController);
exports.CategoriesController = CategoriesController;
let SubCategoriesController = class SubCategoriesController {
    constructor(categoriesService, cacheService) {
        this.categoriesService = categoriesService;
        this.cacheService = cacheService;
    }
    async create(createSubCategoryDto) {
        await this.cacheService.invalidateCacheBySubstring("subCategories");
        return this.categoriesService.createSubCategory(createSubCategoryDto);
    }
    findAll(query) {
        return this.categoriesService.getSubCategories(query);
    }
    findOne(param, language, shopSlug) {
        return this.categoriesService.getSubCategory(param, language, shopSlug);
    }
    async update(id, updateSubCategoryDto) {
        await this.cacheService.invalidateCacheBySubstring("subCategories");
        return this.categoriesService.updateSubCategory(+id, updateSubCategoryDto);
    }
    async remove(id) {
        await this.cacheService.invalidateCacheBySubstring("subCategories");
        return this.categoriesService.removeSubCategory(+id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/category.entity").SubCategory }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateSubCategoryDto]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: require("./dto/get-categories.dto").SubCategoryPaginator }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_categories_dto_1.GetSubCategoriesDto]),
    __metadata("design:returntype", void 0)
], SubCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':param'),
    openapi.ApiResponse({ status: 200, type: require("./entities/category.entity").SubCategory }),
    __param(0, (0, common_1.Param)('param')),
    __param(1, (0, common_1.Query)('language')),
    __param(2, (0, common_1.Query)('shopSlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SubCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/category.entity").SubCategory }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateSubCategoryDto]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubCategoriesController.prototype, "remove", null);
SubCategoriesController = __decorate([
    (0, common_1.Controller)('subCategories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService, cacheService_1.CacheService])
], SubCategoriesController);
exports.SubCategoriesController = SubCategoriesController;
//# sourceMappingURL=categories.controller.js.map
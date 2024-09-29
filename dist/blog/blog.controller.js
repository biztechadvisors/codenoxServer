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
exports.BlogController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const blog_service_1 = require("./blog.service");
const create_blog_dto_1 = require("./dto/create-blog.dto");
const update_blog_dto_1 = require("./dto/update-blog.dto");
const cacheService_1 = require("../helpers/cacheService");
let BlogController = class BlogController {
    constructor(blogService, cacheService) {
        this.blogService = blogService;
        this.cacheService = cacheService;
    }
    async createBlog(createBlogDto) {
        await this.cacheService.invalidateCacheBySubstring("blogs");
        return this.blogService.createBlog(createBlogDto);
    }
    getAllBlogs(shopSlug, regionName, tagName, page = 1, limit = 10, startDate, endDate) {
        return this.blogService.getAllBlogs(shopSlug, regionName, tagName, page, limit, startDate, endDate);
    }
    getBlogById(id) {
        return this.blogService.getBlogById(id);
    }
    async updateBlog(id, updateBlogDto) {
        await this.cacheService.invalidateCacheBySubstring("blogs");
        return this.blogService.updateBlog(id, updateBlogDto);
    }
    async deleteBlog(id) {
        await this.cacheService.invalidateCacheBySubstring("blogs");
        return this.blogService.deleteBlog(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/blog.entity").Blog }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_blog_dto_1.CreateBlogDto]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "createBlog", null);
__decorate([
    (0, common_1.Get)('shop/:shopSlug'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('shopSlug')),
    __param(1, (0, common_1.Query)('regionName')),
    __param(2, (0, common_1.Query)('tagName')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "getAllBlogs", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/blog.entity").Blog }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "getBlogById", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/blog.entity").Blog }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_blog_dto_1.UpdateBlogDto]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "updateBlog", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BlogController.prototype, "deleteBlog", null);
BlogController = __decorate([
    (0, common_1.Controller)('blogs'),
    __metadata("design:paramtypes", [blog_service_1.BlogService,
        cacheService_1.CacheService])
], BlogController);
exports.BlogController = BlogController;
//# sourceMappingURL=blog.controller.js.map
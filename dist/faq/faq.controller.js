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
exports.FAQController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const faq_service_1 = require("./faq.service");
const createfaqdto_dto_1 = require("./dto/createfaqdto.dto");
const createqnadto_dto_1 = require("./dto/createqnadto.dto");
let FAQController = class FAQController {
    constructor(faqService) {
        this.faqService = faqService;
    }
    createFAQ(createFAQDto) {
        return this.faqService.createFAQ(createFAQDto);
    }
    getFAQById(id) {
        return this.faqService.getFAQById(id);
    }
    async getFAQsByShopSlug(shopSlug, page = 1, limit = 10) {
        return this.faqService.getFAQsByShopSlug(shopSlug, page, limit);
    }
    updateFAQ(id, updateFAQDto) {
        return this.faqService.updateFAQ(id, updateFAQDto);
    }
    deleteFAQ(id) {
        return this.faqService.deleteFAQ(id);
    }
    addQnA(faqId, createQnADto) {
        return this.faqService.addQnAToFAQ(faqId, createQnADto);
    }
    updateQnA(id, updateQnADto) {
        return this.faqService.updateQnA(id, updateQnADto);
    }
    deleteQnA(id) {
        return this.faqService.deleteQnA(id);
    }
    getQnAsByFAQId(faqId) {
        return this.faqService.getQnAsByFAQId(faqId);
    }
    async getQnAsByShopId(shopSlug, page = 1, limit = 10) {
        return this.faqService.getQnAsByShopId(shopSlug, page, limit);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/faq.entity").FAQ }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createfaqdto_dto_1.CreateFAQDto]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "createFAQ", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/faq.entity").FAQ }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getFAQById", null);
__decorate([
    (0, common_1.Get)('shop/:shopSlug'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('shopSlug')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getFAQsByShopSlug", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/faq.entity").FAQ }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, createfaqdto_dto_1.UpdateFAQDto]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "updateFAQ", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "deleteFAQ", null);
__decorate([
    (0, common_1.Post)(':faqId/qna'),
    openapi.ApiResponse({ status: 201, type: require("./entities/qna.entity").QnA }),
    __param(0, (0, common_1.Param)('faqId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, createqnadto_dto_1.CreateQnADto]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "addQnA", null);
__decorate([
    (0, common_1.Put)('qna/:id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/qna.entity").QnA }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, createqnadto_dto_1.UpdateQnADto]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "updateQnA", null);
__decorate([
    (0, common_1.Delete)('qna/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "deleteQnA", null);
__decorate([
    (0, common_1.Get)(':faqId/qnas'),
    openapi.ApiResponse({ status: 200, type: [require("./entities/qna.entity").QnA] }),
    __param(0, (0, common_1.Param)('faqId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getQnAsByFAQId", null);
__decorate([
    (0, common_1.Get)('shop/:shopSlug/qnas'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('shopSlug')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], FAQController.prototype, "getQnAsByShopId", null);
FAQController = __decorate([
    (0, common_1.Controller)('faqs'),
    __metadata("design:paramtypes", [faq_service_1.FAQService])
], FAQController);
exports.FAQController = FAQController;
//# sourceMappingURL=faq.controller.js.map
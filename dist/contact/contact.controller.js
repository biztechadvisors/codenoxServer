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
exports.ContactController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const contact_service_1 = require("./contact.service");
const createcontact_dto_1 = require("./dto/createcontact.dto");
const cacheService_1 = require("../helpers/cacheService");
let ContactController = class ContactController {
    constructor(contactService, cacheService) {
        this.contactService = contactService;
        this.cacheService = cacheService;
    }
    async create(createContactDto) {
        await this.cacheService.invalidateCacheBySubstring("contacts");
        return this.contactService.create(createContactDto);
    }
    async findAllByShop(shopSlug, page = 1, limit = 10) {
        return this.contactService.findAllByShop(shopSlug, page, limit);
    }
    findOne(id) {
        return this.contactService.findOne(id);
    }
    async update(id, updateContactDto) {
        await this.cacheService.invalidateCacheBySubstring("contacts");
        return this.contactService.update(id, updateContactDto);
    }
    async remove(id) {
        await this.cacheService.invalidateCacheBySubstring("contacts");
        return this.contactService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entity/createcontact.entitiy").Contact }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createcontact_dto_1.CreateContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('shop/:shopSlug'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('shopSlug')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "findAllByShop", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entity/createcontact.entitiy").Contact }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entity/createcontact.entitiy").Contact }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, createcontact_dto_1.UpdateContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "remove", null);
ContactController = __decorate([
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [contact_service_1.ContactService, cacheService_1.CacheService])
], ContactController);
exports.ContactController = ContactController;
//# sourceMappingURL=contact.controller.js.map
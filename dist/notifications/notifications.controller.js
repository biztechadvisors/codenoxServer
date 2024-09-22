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
var NotificationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./services/notifications.service");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationController = NotificationController_1 = class NotificationController {
    constructor(notificationService, notificationGateway) {
        this.notificationService = notificationService;
        this.notificationGateway = notificationGateway;
        this.logger = new common_1.Logger(NotificationController_1.name);
    }
    async createNotification(createNotificationDto) {
        this.logger.log(`Creating notification for user ${createNotificationDto.userId}`);
        const notification = await this.notificationService.createNotification(createNotificationDto.userId, createNotificationDto.title, createNotificationDto.message);
        this.notificationGateway.notifyUser(createNotificationDto.userId, notification);
        return notification;
    }
    async markAsSeen(id) {
        await this.notificationService.markAsSeen(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./entities/notifications.entity").Notification }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, common_1.Patch)('seen/:id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsSeen", null);
NotificationController = NotificationController_1 = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notifications_service_1.NotificationService,
        notifications_gateway_1.NotificationGateway])
], NotificationController);
exports.NotificationController = NotificationController;
//# sourceMappingURL=notifications.controller.js.map
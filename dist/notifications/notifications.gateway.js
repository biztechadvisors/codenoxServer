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
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const notifications_service_1 = require("./services/notifications.service");
const common_1 = require("@nestjs/common");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.connectedClients = new Map();
        this.logger = new common_1.Logger(NotificationGateway_1.name);
    }
    async handleConnection(client) {
        const userId = +client.handshake.query.userId;
        if (userId) {
            this.connectedClients.set(userId, client.id);
            client.join(`user_${userId}`);
            this.logger.log(`User ${userId} connected with client ID ${client.id}`);
            const notifications = await this.notificationService.getNotifications(userId);
            notifications.forEach(notification => {
                this.notifyUser(userId, notification);
            });
        }
        else {
            this.logger.warn('User ID is missing in connection query');
        }
    }
    handleDisconnect(client) {
        const userId = +client.handshake.query.userId;
        if (userId) {
            this.connectedClients.delete(userId);
            client.leave(`user_${userId}`);
            this.logger.log(`User ${userId} disconnected`);
        }
    }
    notifyUser(userId, notification) {
        const socketId = this.connectedClients.get(userId);
        this.logger.log(`Notifying user ${userId}, socket ID: ${socketId}`);
        if (socketId) {
            this.server.to(`user_${userId}`).emit('notification', {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                timestamp: notification.createdAt,
            });
            this.logger.log(`Notification sent to user ${userId}: ${notification.title}`);
        }
        else {
            this.logger.warn(`User ${userId} not connected, could not send notification`);
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
NotificationGateway = NotificationGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({ namespace: 'notifications', cors: { origin: '*' } }),
    __metadata("design:paramtypes", [notifications_service_1.NotificationService])
], NotificationGateway);
exports.NotificationGateway = NotificationGateway;
//# sourceMappingURL=notifications.gateway.js.map
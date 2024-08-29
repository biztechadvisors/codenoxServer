import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './services/notifications.service';
import { Logger } from '@nestjs/common';
import { Notification } from './entities/notifications.entity';

@WebSocketGateway({ namespace: 'notifications', cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients: Map<number, string> = new Map();
    private readonly logger = new Logger(NotificationGateway.name);

    constructor(private notificationService: NotificationService) { }

    async handleConnection(client: Socket) {
        const userId = +client.handshake.query.userId;
        if (userId) {
            this.connectedClients.set(userId, client.id);
            client.join(`user_${userId}`);
            this.logger.log(`User ${userId} connected with client ID ${client.id}`);

            // Fetch existing unseen notifications for the user
            const notifications = await this.notificationService.getNotifications(userId);
            notifications.forEach(notification => {
                this.notifyUser(userId, notification);
            });
        } else {
            this.logger.warn('User ID is missing in connection query');
        }
    }

    handleDisconnect(client: Socket) {
        const userId = +client.handshake.query.userId;
        if (userId) {
            this.connectedClients.delete(userId);
            client.leave(`user_${userId}`);
            this.logger.log(`User ${userId} disconnected`);
        }
    }

    notifyUser(userId: number, notification: Notification) {
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
        } else {
            this.logger.warn(`User ${userId} not connected, could not send notification`);
        }
    }
}

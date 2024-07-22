import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './services/notifications.service';

@WebSocketGateway({ namespace: 'notifications', cors: { origin: '*' } })  // Add CORS configuration here
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients: Map<number, string> = new Map();

    constructor(private notificationService: NotificationService) { }

    handleConnection(client: Socket) {
        const userId = +client.handshake.query.userId;
        if (userId) {
            this.connectedClients.set(userId, client.id);
            client.join(`user_${userId}`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = +client.handshake.query.userId;
        if (userId) {
            this.connectedClients.delete(userId);
            client.leave(`user_${userId}`);
        }
    }

    notifyUser(userId: number, title: string, message: string) {
        const socketId = this.connectedClients.get(userId);
        if (socketId) {
            this.server.to(socketId).emit('notification', { title, message });
        }
    }
}

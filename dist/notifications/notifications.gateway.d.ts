import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './services/notifications.service';
import { Notification } from './entities/notifications.entity';
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private notificationService;
    server: Server;
    private connectedClients;
    private readonly logger;
    constructor(notificationService: NotificationService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    notifyUser(userId: number, notification: Notification): void;
}

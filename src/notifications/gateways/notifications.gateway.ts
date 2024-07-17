import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    namespace: '/notifications',
    cors: {
        origin: '*',
    },
})
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('subscribe')
    handleSubscribe(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
        const { userId } = data;
        client.join(userId);
    }

    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(@MessageBody() data: any, @ConnectedSocket() client: Socket): void {
        const { userId } = data;
        client.leave(userId);
    }

    sendNotification(userId: string, message: string): void {
        this.server.to(userId).emit('notification', message);
    }
}

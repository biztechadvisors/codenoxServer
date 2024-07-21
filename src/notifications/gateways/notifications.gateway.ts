import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    namespace: '/notifications',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['x-user-id'],
    },
})
export class NotificationsGateway {
    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket) {
        const userId = socket.handshake.headers['x-user-id'];
        console.log(`User connected: ${userId}`);
        if (userId) {
            socket.join(userId); // Automatically join the room for the user
        }
    }

    handleDisconnect(socket: Socket) {
        console.log('User disconnected');
    }

    @SubscribeMessage('subscribe')
    handleSubscribe(@MessageBody() data: { userId: string }, @ConnectedSocket() socket: Socket) {
        console.log(`User subscribed: ${data.userId}`);
        socket.join(data.userId); // Join the room for the user
    }

    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(@MessageBody() data: { userId: string }, @ConnectedSocket() socket: Socket) {
        console.log(`User unsubscribed: ${data.userId}`);
        socket.leave(data.userId); // Leave the room for the user
    }

    @SubscribeMessage('notify')
    handleNotify(@MessageBody() data: { userId: string, message: string }, @ConnectedSocket() socket: Socket) {
        console.log(`Notify ${data.userId}: ${data.message}`);
        this.server.to(data.userId).emit('notification', { userId: data.userId, message: data.message }); // Broadcast to the specific user
    }

    sendNotification(userId: string, message: string) {
        console.log(`Sending notification to ${userId}: ${message}`);
        this.server.to(userId).emit('notification', message); // Broadcast to the specific user
    }
}

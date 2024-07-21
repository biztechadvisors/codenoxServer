import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationsGateway: NotificationsGateway) { }

    notifyUser(userId: string, message: string): void {
        console.log(`Notifying user ${userId} with message: ${message}`);
        this.notificationsGateway.sendNotification(userId, message);
    }
}

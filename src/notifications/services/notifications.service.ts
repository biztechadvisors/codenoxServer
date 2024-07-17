import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(private readonly notificationsGateway: NotificationsGateway) { }

    notifyUser(userId: string, message: string): void {
        this.notificationsGateway.sendNotification(userId, message);
    }
}

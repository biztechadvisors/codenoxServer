import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './services/notifications.service';
import { NotificationGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationController {
    constructor(
        private notificationService: NotificationService,
        private notificationGateway: NotificationGateway
    ) { }

    @Post()
    async createNotification(@Body() createNotificationDto: { userId: number; title: string; message: string }) {
        const notification = await this.notificationService.createNotification(createNotificationDto.userId, createNotificationDto.title, createNotificationDto.message);
        this.notificationGateway.notifyUser(createNotificationDto.userId, createNotificationDto.title, createNotificationDto.message);
        return notification;
    }
}

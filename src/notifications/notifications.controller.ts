import { Controller, Patch, Param, Post, Body, Logger } from '@nestjs/common';
import { NotificationService } from './services/notifications.service';
import { NotificationGateway } from './notifications.gateway';

@Controller('notifications')
export class NotificationController {
    private readonly logger = new Logger(NotificationController.name);

    constructor(
        private notificationService: NotificationService,
        private notificationGateway: NotificationGateway
    ) { }

    @Post()
    async createNotification(@Body() createNotificationDto: { userId: number; title: string; message: string }) {
        this.logger.log(`Creating notification for user ${createNotificationDto.userId}`);
        const notification = await this.notificationService.createNotification(createNotificationDto.userId, createNotificationDto.title, createNotificationDto.message);
        this.notificationGateway.notifyUser(createNotificationDto.userId, notification);
        return notification;
    }

    @Patch('seen/:id')
    async markAsSeen(@Param('id') id: number): Promise<void> {
        await this.notificationService.markAsSeen(id);
    }
}

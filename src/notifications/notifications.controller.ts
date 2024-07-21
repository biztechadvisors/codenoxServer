import { Controller, Post, Req, Body } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';

@Controller('notify')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('send')
    sendNotification(@Req() req, @Body() createNotificationDto: { message: string }): string {
        const userId = req['userId'];
        const { message } = createNotificationDto;
        console.log(`Sending notification to ${userId} with message: ${message}`);
        this.notificationsService.notifyUser(userId, message);
        return 'Notification sent';
    }
}
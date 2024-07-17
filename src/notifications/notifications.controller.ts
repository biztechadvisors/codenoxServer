import { Controller, Post, Req, Body } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notify')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('send')
    sendNotification(@Req() req, @Body() createNotificationDto: CreateNotificationDto): string {
        const userId = req['userId'];
        const { message } = createNotificationDto;
        this.notificationsService.notifyUser(userId, message);
        return 'Notification sent';
    }
}

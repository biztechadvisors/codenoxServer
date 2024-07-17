import { Module } from '@nestjs/common';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
    providers: [NotificationsGateway, NotificationsService],
    exports: [NotificationsService],
    controllers: [NotificationsController],
})
export class NotificationsModule { }

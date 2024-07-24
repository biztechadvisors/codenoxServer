import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './services/notifications.service';
import { NotificationGateway } from './notifications.gateway';
import { NotificationController } from './notifications.controller';
import { Notification } from './entities/notifications.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [NotificationService, NotificationGateway],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule { }

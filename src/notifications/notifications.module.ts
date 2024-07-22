import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './services/notifications.service';
import { Notification } from './entities/notifications.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    providers: [NotificationService],
    exports: [NotificationService], // Export NotificationService
})
export class NotificationModule { }

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notifications.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NotificationService {
    private cache = new Map<number, Notification[]>();

    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) { }

    async createNotification(userId: number, title: string, message: string): Promise<Notification> {
        const notification = this.notificationRepository.create({ message, user: { id: userId } });
        await this.notificationRepository.save(notification);

        // Update cache
        const userNotifications = this.cache.get(userId) || [];
        userNotifications.unshift(notification);
        if (userNotifications.length > 15) {
            userNotifications.pop();
        }
        this.cache.set(userId, userNotifications);

        return notification;
    }

    getNotifications(userId: number): Notification[] {
        return this.cache.get(userId) || [];
    }
}
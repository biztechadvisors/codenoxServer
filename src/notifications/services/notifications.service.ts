import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Notification } from '../entities/notifications.entity';

@Injectable()
export class NotificationService {
    private cache = new Map<number, Notification[]>();

    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) { }

    async createNotification(userId: number, title: string, message: string): Promise<Notification> {
        const notification = this.notificationRepository.create({ title, message, user: { id: userId } as User });
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

    async getNotifications(userId: number): Promise<Notification[]> {
        // Fetch notifications from the database to ensure cache consistency
        return await this.notificationRepository.find({
            where: { user: { id: userId }, seen: false },
            order: { createdAt: 'DESC' },
            take: 15,
        });
    }

    async markAsSeen(notificationId: number): Promise<void> {
        await this.notificationRepository.update(notificationId, { seen: true });
    }
}





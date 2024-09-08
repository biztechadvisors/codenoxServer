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
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async createNotification(userId: number, title: string, message: string): Promise<Notification> {
        // Check if the user exists before creating the notification
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error(`User with ID ${userId} does not exist.`);
        }

        const notification = this.notificationRepository.create({ title, message, user });
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





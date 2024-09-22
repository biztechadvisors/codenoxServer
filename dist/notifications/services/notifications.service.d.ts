import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Notification } from '../entities/notifications.entity';
export declare class NotificationService {
    private notificationRepository;
    private userRepository;
    private cache;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>);
    createNotification(userId: number, title: string, message: string): Promise<Notification>;
    getNotifications(userId: number): Promise<Notification[]>;
    markAsSeen(notificationId: number): Promise<void>;
}

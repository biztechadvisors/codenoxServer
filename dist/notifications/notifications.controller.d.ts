import { NotificationService } from './services/notifications.service';
import { NotificationGateway } from './notifications.gateway';
export declare class NotificationController {
    private notificationService;
    private notificationGateway;
    private readonly logger;
    constructor(notificationService: NotificationService, notificationGateway: NotificationGateway);
    createNotification(createNotificationDto: {
        userId: number;
        title: string;
        message: string;
    }): Promise<import("./entities/notifications.entity").Notification>;
    markAsSeen(id: number): Promise<void>;
}

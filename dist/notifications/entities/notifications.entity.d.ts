import { User } from 'src/users/entities/user.entity';
export declare class Notification {
    id: number;
    message: string;
    title: string;
    seen: boolean;
    user: User;
    createdAt: Date;
}

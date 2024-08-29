import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column()
    title: string;

    @Column({ default: false })
    seen: boolean; // Track if the notification has been seen

    @ManyToOne(() => User, user => user.notifications, {
        onDelete: 'CASCADE', // Automatically delete child rows when parent is deleted
        onUpdate: 'CASCADE', // Automatically update child rows when parent is updated
    })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}

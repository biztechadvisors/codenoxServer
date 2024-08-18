import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column()
    title: string;

    @ManyToOne(() => User, user => user.notifications, {
        onDelete: 'CASCADE', // Automatically delete child rows when parent is deleted
        onUpdate: 'CASCADE', // Automatically update child rows when parent is updated
    })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}

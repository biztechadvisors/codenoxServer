import { User } from 'src/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @ManyToOne(() => User, user => user.notifications)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}

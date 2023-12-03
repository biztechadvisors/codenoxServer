import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Attachment } from "src/common/entities/attachment.entity";
import { CoreEntity } from "src/common/entities/core.entity";

@Entity()
export class Social {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    link: string;
}

@Entity()
export class Profile extends CoreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Attachment, { cascade: true })
    @JoinColumn({ name: 'avatarId' })
    avatar: Attachment;

    @Column()
    bio?: string;

    @ManyToOne(() => Social, { cascade: true })
    socials?: Social;

    @Column()
    contact?: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    customer?: User;
}
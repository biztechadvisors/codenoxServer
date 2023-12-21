/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Attachment } from "src/common/entities/attachment.entity";
import { CoreEntity } from "src/common/entities/core.entity";

@Entity()
export class Profile extends CoreEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Attachment, { cascade: true })
    @JoinColumn({ name: 'avatarId' })
    avatar: Attachment;

    @Column()
    bio?: string;

    @ManyToOne(() => Social, { onDelete: 'CASCADE' })
    socials?: Social;

    @Column()
    contact?: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
    customer?: User;
}

@Entity()
export class Social {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    link: string;

    @ManyToOne(()=> Profile, { cascade: true })
    @JoinColumn({name:'ProfileId'})
    profile: Profile;

}
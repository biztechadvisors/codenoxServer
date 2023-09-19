import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => Attachment)
  avatar?: Attachment;
  @Column()
  bio?: string;
  @OneToOne(() => Social)
  socials?: Social[];
  @Column()
  contact?: string;
  @OneToOne(() => User, (user) => user.profile)
  customer?: User;
}

@Entity()
export class Social {
  @Column()
  type: string;
  @Column()
  link: string;
}

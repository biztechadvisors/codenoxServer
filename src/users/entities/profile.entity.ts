import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from './user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

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
  @ManyToOne(() => Attachment, { cascade: ['insert', 'update'] })
  avatar?: Attachment;
  @Column()
  bio?: string;
  @ManyToOne(() => Social)
  socials?: Social;
  @Column()
  contact?: string;
  @ManyToOne(() => User)
  customer?: User;
}


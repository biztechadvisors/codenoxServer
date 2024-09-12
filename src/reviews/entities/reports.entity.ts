/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Report extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  user_id?: number;
  @ManyToMany(() => User)
  @JoinTable({ name: "report_user" })
  user: User[];
  @Column()
  model_id: number;
  @Column()
  model_type: string;
  @Column()
  message: string;
}
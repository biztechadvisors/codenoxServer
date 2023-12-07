/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Feedback extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(()=> User)
  @JoinColumn()
  user: User;
  @Column()
  model_type: string;
  @Column()
  model_id: number;
  @Column()
  positive?: boolean;
  @Column()
  negative?: boolean;
}

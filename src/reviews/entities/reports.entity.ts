/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity'
import { User } from 'src/users/entities/user.entity'
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Report extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  user_id?: number
  @OneToOne(() => User)
  user: User[]
  @Column()
  model_id: number
  @Column()
  model_type: string
  @Column()
  message: string
}

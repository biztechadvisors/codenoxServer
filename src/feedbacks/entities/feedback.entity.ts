/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Feedback extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  user_id: string
  @Column()
  model_type: string
  @Column()
  model_id: number
  @Column()
  positive?: boolean
  @Column()
  negative?: boolean
}

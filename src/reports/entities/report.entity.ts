/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class MyReports extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  message: string
}

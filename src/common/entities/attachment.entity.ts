/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

// attachment.entity.ts
@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number
  @Column({ nullable: true }) // make the column nullable
  thumbnail?: string
  @Column({ nullable: true }) // make the column nullable
  original?: string
}

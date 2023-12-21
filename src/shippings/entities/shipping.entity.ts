/* eslint-disable prettier/prettier */
<<<<<<< HEAD
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
=======
import { CoreEntity } from 'src/common/entities/core.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

@Entity()
export class Shipping extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  name: string
  @Column()
  amount: number
  @Column()
  is_global: boolean
  @Column()
  type: ShippingType
}

export enum ShippingType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE = 'free',
}

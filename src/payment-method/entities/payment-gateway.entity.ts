/* eslint-disable prettier/prettier */
<<<<<<< HEAD
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
=======
import { CoreEntity } from 'src/common/entities/core.entity'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

@Entity()
export class PaymentGateWay extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  user_id: number
  @Column()
  customer_id: string
  @Column()
  gateway_name: string
}

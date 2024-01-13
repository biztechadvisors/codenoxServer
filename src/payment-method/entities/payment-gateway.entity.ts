/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

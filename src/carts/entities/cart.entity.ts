/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity'
import { Entity, PrimaryColumn, Column } from 'typeorm'
@Entity()
export class Cart extends CoreEntity {
  @PrimaryColumn('integer', { generated: true })
  id: number
  @Column('integer')
  customerId: number
  @Column({ type: 'varchar'})
  email: string
  @Column('integer')
  phone: number
  @Column({ type: 'json' })
  cartData: string
  @Column('integer')
  cartQuantity: number
}
/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { User } from 'src/users/entities/user.entity'
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'

enum StoreNoticePriorityType {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

@Entity()
export class StoreNotice extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  priority: StoreNoticePriorityType
  @Column()
  notice: string
  @Column()
  description?: string
  @Column()
  effective_from?: string
  @Column()
  expired_at: string
  @Column()
  type?: string
  @Column()
  is_read?: boolean
  @ManyToMany(() => Shop)
  @JoinTable({ name: "storeNotice_shops" })
  shops?: Shop[]
  @ManyToMany(() => User)
  @JoinTable({ name: "storeNotice_users" })
  users?: User[]
  @Column()
  received_by?: string
  @Column()
  created_by: string
  @Column()
  expire_at: string
  @Column()
  deleted_at?: string
  @Column({ type: 'json' })
  translated_languages: string[]
  @Column({ type: 'varchar' })
  creator?: string
}

/* eslint-disable prettier/prettier */
import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class ShopSettings {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  website: string
  @OneToOne(() => ShopSocials)
  @JoinColumn()
  socials: ShopSocials[]
  @Column()
  contact: string
  @OneToOne(() => Location)
  @JoinColumn()
  location: Location

}

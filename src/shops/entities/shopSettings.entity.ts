/* eslint-disable prettier/prettier */
import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class ShopSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => ShopSocials, { cascade: true, eager: true })
  @JoinTable({ name: "shopSettings_shopSocials" })
  socials: ShopSocials[];

  @Column()
  contact: string;

  @ManyToOne(() => Location)
  location: Location;

  @Column()
  website: string;
}
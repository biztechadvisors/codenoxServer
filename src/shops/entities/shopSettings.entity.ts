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

  @ManyToMany(() => ShopSocials, { onUpdate: "CASCADE" })
  @JoinTable({ name: "shopSettings_shopSocials" })
  socials: ShopSocials[];

  @Column({ nullable: true })
  contact: string;

  @ManyToOne(() => Location, { onDelete: "CASCADE", nullable: true })
  location: Location;

  @Column({ nullable: true })
  website: string;
}
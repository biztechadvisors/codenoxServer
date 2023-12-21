import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ShopSettings {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToMany(() => ShopSocials)
  @JoinTable()
  socials: ShopSocials[];
  @Column()
  contact: string;
  @ManyToOne(() => Location)
  location: Location;
  @Column()
  website: string;
}
import { Location, ShopSocials } from 'src/settings/entities/setting.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ShopSettings {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => ShopSocials)
  socials: ShopSocials[];
  @Column()
  contact: string;
  @OneToOne(() => Location)
  location: Location;
  @Column()
  website: string;
}
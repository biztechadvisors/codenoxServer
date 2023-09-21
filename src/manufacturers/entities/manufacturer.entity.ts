import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';
import { Type } from '../../types/entities/type.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Manufacturer extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => Attachment)
  cover_image?: Attachment;
  @Column()
  description?: string;
  @OneToOne(() => Attachment)
  image?: Attachment;
  @Column()
  is_approved?: boolean;
  @Column()
  name: string;
  @Column()
  products_count?: number;
  @Column()
  slug?: string;
  @OneToOne(() => ShopSocials)
  socials?: ShopSocials;
  @OneToOne(() => Type)
  type: Type;
  @Column()
  type_id?: string;
  @Column()
  website?: string;
  @Column()
  language?: string;
  @Column({ type: "json" })
  translated_languages?: string[];
}

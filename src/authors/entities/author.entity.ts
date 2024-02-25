/* eslint-disable prettier/prettier */
import { CoreEntity } from '../../common/entities/core.entity';
import { Attachment } from '../../common/entities/attachment.entity';
import { ShopSocials } from '../../settings/entities/setting.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Author extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bio?: string;
  
  @Column()
  born?: string;

  @OneToOne(() => Attachment, { cascade: true })
  @JoinColumn()
  cover_image: Attachment;

  @Column()
  death?: string;

  @OneToOne(() => Attachment, { cascade: true })
  @JoinColumn()
  image?: Attachment;

  @Column()
  is_approved?: boolean;

  @Column()
  languages?: string;

  @Column()
  name: string;

  @Column()
  products_count?: number;

  @Column()
  quote?: string;

  @Column()
  slug?: string;

  @ManyToMany(() => ShopSocials, { cascade: true })
  @JoinTable()
  socials: ShopSocials[]

  @Column()
  language?: string;

  @Column({ type: 'json' })
  translated_languages?: string[];
}

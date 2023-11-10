import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title?: string;
  @Column()
  description?: string;
  @OneToOne(() => Attachment, { nullable: true })
  image?: Attachment; // Use an optional '?' to indicate nullable
}

@Entity()
export class TypeSettings {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  isHome: boolean;
  @Column()
  layoutType: string;
  @Column()
  productCard: string;
}

@Entity()
export class Type extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  slug: string;
  @OneToOne(() => Attachment, { nullable: true, eager: true })
  @JoinColumn()
  image: Attachment;
  @Column()
  icon: string;
  @ManyToMany((type) => Banner, (banner) => banner.id, {
    cascade: true,
  })
  @JoinTable()
  banners?: Banner[];
  @ManyToMany((type) => Attachment, (attachment) => attachment.id, {
    cascade: true,
  })
  @JoinTable()
  promotional_sliders?: Attachment[];
  @OneToOne(() => TypeSettings, { nullable: true, eager: true })
  @JoinColumn()
  settings: TypeSettings;
  @Column()
  language: string;
  @Column({ type: 'json' })
  translated_languages: string[];
}

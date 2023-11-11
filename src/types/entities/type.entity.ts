import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';

@Entity()
export class TypeSettings extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  isHome: boolean;
  @Column()
  layoutType: string;
  @Column()
  productCard: string;
  @OneToMany(() => Type, type => type.settings)
  types: Type[];
}

@Entity()
export class Banner extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  title?: string;
  @Column({ nullable: true })
  description?: string;
  @ManyToOne(() => Attachment)
  @JoinColumn()
  image: Attachment;
  @OneToMany(() => Type, type => type.banners)
  types: Type[];
}

@Entity()
export class Type extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  slug: string;
  @ManyToOne(() => Attachment)
  @JoinColumn()
  image: Attachment;
  @Column()
  icon: string;
  @OneToMany(() => Banner, banner => banner.types)
  banners: Banner[];
  @ManyToOne(() => Attachment)
  @JoinColumn()
  promotional_sliders: Attachment[];
  @ManyToOne(() => TypeSettings, settings => settings.types)
  @JoinColumn()
  settings: TypeSettings;
  @Column()
  language: string;
  @Column({ type: 'json' })
  translated_languages: string[];
}

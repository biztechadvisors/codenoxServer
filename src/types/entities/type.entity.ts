import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';

// TypeSettings entity
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

// Type entity
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
  @OneToMany(() => Banner, banner => banner.type, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  banners: Banner[];
  @OneToMany(() => Attachment, () => Type, { eager: true })
  promotional_sliders: Attachment[];
  @OneToOne(() => TypeSettings)
  @JoinColumn()
  settings: TypeSettings;
  @Column()
  language: string;
  @Column({ type: 'json' })
  translated_languages: string[];
}

// Banner entity
@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  title: string;
  @Column({ nullable: true })
  description: string;
  @ManyToOne(() => Attachment)
  @JoinColumn()
  image: Attachment;
  @ManyToOne(() => Type, type => type.banners)
  type: Type;
}

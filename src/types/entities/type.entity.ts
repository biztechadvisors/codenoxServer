import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title?: string;
  @Column()
  description?: string;
  @ManyToOne(() => Attachment)
  image: Attachment;
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
  @ManyToOne(() => Attachment)
  image: Attachment;
  @Column()
  icon: string;
  @ManyToOne(() => Banner)
  banners?: Banner[];
  @ManyToOne(() => Attachment)
  promotional_sliders?: Attachment[];
  @ManyToOne(() => TypeSettings)
  settings?: TypeSettings;
  @Column()
  language: string;
  @Column({ type: 'json' })
  translated_languages: string[];
}

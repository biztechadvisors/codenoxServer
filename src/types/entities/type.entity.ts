import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable } from 'typeorm';
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
  @OneToOne(() => Attachment)
  @JoinColumn()
  image: Attachment;
  @Column()
  icon: string;
  @OneToMany(() => Banner, banner => banner.type, { cascade: true })
  banners?: Banner[];
  @ManyToMany(() => Attachment) // Replace @OneToMany with @ManyToMany
  @JoinTable({ // Create a join table between Type and Attachment
    name: 'type_promotional_sliders',
    joinColumn: { name: 'typeId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'attachmentId', referencedColumnName: 'id' }
  })
  promotional_sliders?: Attachment[];
  @OneToOne(() => TypeSettings)
  @JoinColumn()
  settings?: TypeSettings;
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
  title?: string;
  @Column({ nullable: true })
  description?: string;
  @OneToOne(() => Attachment)
  @JoinColumn({ name: 'imageId', referencedColumnName: 'id' })
  image: Attachment;
  @ManyToOne(() => Type, type => type.banners)
  type: Type;
}

import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tag extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  parent: number | null;

  @Column()
  details: string;

  @OneToOne(() => Attachment)
  @JoinColumn({ name: 'imageId', referencedColumnName: 'id' })
  image: Attachment | null;

  @Column()
  icon: string;

  @ManyToOne(() => Type, { nullable: true, eager: true })
  @JoinColumn()
  type: Type | null;

  @ManyToMany(() => Product, product => product.tags)
  @JoinTable()
  products: Product[];

  @Column()
  language: string;

  @Column({ type: 'json' })
  translatedLanguages: string[];
}

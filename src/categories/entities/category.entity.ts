import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';
import { Column, Entity, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  slug: string;
  @Column()
  parent?: Category;
  @Column()
  children?: Category[];
  @Column()
  details?: string;
  @OneToOne(() => Attachment)
  image?: Attachment;
  @Column()
  icon?: string;
  @OneToOne(() => Type)
  type?: Type;
  @ManyToMany(() => Product, product => product.categories)
  products?: Product[];
  @Column()
  language: string;
  @Column()
  translated_languages: string[];
}

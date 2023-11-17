// import { Attachment } from 'src/common/entities/attachment.entity';
// import { CoreEntity } from 'src/common/entities/core.entity';
// import { Product } from 'src/products/entities/product.entity';
// import { Type } from 'src/types/entities/type.entity';
// import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// export class Category extends CoreEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   name: string;

//   @Column()
//   slug: string;

//   @OneToOne(() => Category, { nullable: true })
//   @JoinColumn()
//   parent?: Category;

//   @ManyToOne(() => Category)
//   children?: Category[];

//   @Column()
//   details?: string;

//   @ManyToOne(() => Attachment)
//   @JoinColumn()
//   image?: Attachment;

//   @Column()
//   icon?: string;

//   @ManyToOne(() => Type)
//   @JoinColumn()
//   type?: Type;

//   @ManyToMany(() => Product, product => product.categories)
//   @JoinColumn()
//   products: Product[];

//   @Column()
//   language: string;

//   @Column({ type: 'json' })
//   translated_languages: string[];

//   @Column()
//   products_count: number;
// }


import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { Type } from 'src/types/entities/type.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToOne(() => Category, { nullable: true })
  @JoinColumn()
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  children?: Category[];

  @Column()
  details?: string;

  @ManyToOne(() => Attachment, { eager: true }) // assuming you want to eagerly load the image
  @JoinColumn()
  image?: Attachment;

  @Column()
  icon?: string;

  @ManyToOne(() => Type)
  @JoinColumn()
  type?: Type;

  @ManyToMany(() => Product, product => product.categories)
  @JoinTable()
  products: Product[];

  @Column()
  language: string;

  @Column({ type: 'json' })
  translated_languages: string[];

  @Column()
  products_count: number;
}

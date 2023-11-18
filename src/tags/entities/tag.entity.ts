/* eslint-disable prettier/prettier */
import { Attachment } from 'src/common/entities/attachment.entity'
import { CoreEntity } from 'src/common/entities/core.entity'
import { Product } from 'src/products/entities/product.entity'
import { Type } from 'src/types/entities/type.entity'
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class Tag extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  name: string
  @Column()
  slug: string
  @Column()
  parent: number
  @Column()
  details: string
  @OneToOne(() => Attachment)
  @JoinColumn()
  image: Attachment
  @Column()
  icon: string
  @OneToOne(() => Type)
  @JoinColumn()
  type: Type
  @ManyToMany(() => Product, (product) => product.tags)
  @JoinTable({
    // Create a join table between Type and Attachment
    name: 'tag_product',
    joinColumn: { name: 'tagId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  products: Product[]
  @Column()
  language: string
  @Column({ type: 'json' })
  translated_languages: string[]
}

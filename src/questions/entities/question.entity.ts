import { CoreEntity } from 'src/common/entities/core.entity'
import { Product } from 'src/products/entities/product.entity'
import { User } from 'src/users/entities/user.entity'
import { Feedback } from '../../feedbacks/entities/feedback.entity'
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class Question extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  user_id: number
  @Column()
  product_id: number
  @Column()
  shop_id: number
  @Column()
  question?: string
  @Column()
  answer: string
  @Column()
  positive_feedbacks_count?: number
  @Column()
  negative_feedbacks_count?: number
  @OneToOne(() => Product)
  product: Product
  @OneToOne(() => User)
  user: User
  @ManyToMany(() => Feedback)
  feedbacks?: Feedback[]
  @OneToOne(() => Feedback)
  my_feedback?: Feedback
}

/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Question extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  user_id: number;
  @Column()
  product_id: number;
  @Column()
  shop_id: number;
  @Column()
  question?: string;
  @Column()
  answer: string;
  @Column()
  positive_feedbacks_count?: number;
  @Column()
  negative_feedbacks_count?: number;
  @OneToOne(() => Product, { cascade: true })
  @JoinColumn()
  product: number;
  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: number;
  @ManyToMany(() => Feedback, { cascade: true })
  @JoinTable({ name: "question_feedback" })
  feedbacks?: Feedback[];
  @OneToOne(() => Feedback, { cascade: true })
  my_feedback?: Feedback;
}
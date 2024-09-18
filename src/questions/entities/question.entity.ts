/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Feedback } from '../../feedbacks/entities/feedback.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Question extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })  // Optional field, so nullable should be true
  question?: string;

  @Column({ nullable: true })  // If the answer is optional, otherwise remove `nullable: true`
  answer?: string;

  @Column({ default: 0 })  // Initialize with 0 to avoid null values
  positive_feedbacks_count: number = 0;

  @Column({ default: 0 })  // Initialize with 0 to avoid null values
  negative_feedbacks_count: number = 0;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'product_id' })  // Manage foreign key through relation
  product: Product;

  @Column()
  shop_id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })  // Manage foreign key through relation
  user: User;

  @ManyToMany(() => Feedback, { cascade: true })
  @JoinTable({ name: "question_feedback" })  // Specify the join table for feedbacks
  feedbacks?: Feedback[];

  @OneToOne(() => Feedback, { cascade: true, nullable: true })  // Optional personal feedback for this question
  @JoinColumn({ name: 'my_feedback_id' })  // Ensure correct FK handling
  my_feedback?: Feedback;
}

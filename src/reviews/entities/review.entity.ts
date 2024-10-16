/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Report } from './reports.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Review extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column()
  name: string;

  @Column()
  comment: string;

  @ManyToOne(() => Shop, { nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' }) // Since this should refer to one specific order, use ManyToOne
  order: Order;

  @ManyToMany(() => Attachment, { cascade: true })
  @JoinTable({ name: 'review_attachment' })
  photos: Attachment[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, product => product.my_review, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToMany(() => Feedback)
  @JoinTable({ name: 'review_feedback' })
  feedbacks: Feedback[];

  @OneToOne(() => Feedback, { nullable: true })
  @JoinColumn({ name: 'my_feedback_id' })
  my_feedback: Feedback;

  @Column({ default: 0 })
  positive_feedbacks_count: number;

  @Column({ default: 0 })
  negative_feedbacks_count: number;

  @ManyToMany(() => Report)
  @JoinTable({ name: 'review_report' })
  abusive_reports: Report[];

  @Column({ nullable: true })
  variation_option_id?: string;

  @Column({ default: 0 })
  abusive_reports_count?: number;
}

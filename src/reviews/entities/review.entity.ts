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

  @OneToOne(() => Shop)
  @JoinColumn()
  shop: Shop;

  @OneToOne(() => Order)
  @JoinColumn()
  order: Order;

  @OneToOne(() => User)
  @JoinColumn()
  customer: User;

  @ManyToMany(() => Attachment)
  @JoinTable()
  photos: Attachment[];

  @OneToOne(() => User)
  @JoinColumn()
  user: User;


  @ManyToOne(() => Product, product => product.my_review)
  product: Product;


  @ManyToMany(() => Feedback)
  @JoinTable()
  feedbacks: Feedback[];

  @OneToOne(() => Feedback)
  @JoinColumn()
  my_feedback: Feedback;

  @Column()
  positive_feedbacks_count: number;
  @Column()
  negative_feedbacks_count: number;
  @Column()
  user_id: number;
  @Column()
  product_id: number;

  @ManyToMany(() => Report)
  @JoinTable()
  abusive_reports: Report[];

  @Column()
  shop_id: string;
  @Column()
  variation_option_id: string;
  @Column()
  abusive_reports_count?: number;
}
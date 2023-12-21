/* eslint-disable prettier/prettier */
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Report } from './reports.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
<<<<<<< HEAD
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
=======
import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

@Entity()
export class Review extends CoreEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  rating: number
  @Column()
  name: string
  @Column()
  comment: string;
<<<<<<< HEAD

=======
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  @OneToOne(() => Shop)
  shop: Shop;
<<<<<<< HEAD

=======
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  @OneToOne(() => Order)
  order: Order;
<<<<<<< HEAD

  // @OneToOne(() => User)
  // @JoinColumn()
  // customer: User;

  @ManyToMany(() => Attachment)
  @JoinTable()
  photos: Attachment[];

  // @OneToOne(() => User)
  // @JoinColumn()
  // user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
=======
  @OneToOne(() => User)
  customer: User;
  @OneToOne(() => Attachment)
  photos: Attachment[];
  @OneToOne(() => User)
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  user: User;
  @ManyToOne(() => Product, product => product.my_review)
  product: Product;
  @ManyToMany(() => Feedback)
  feedbacks: Feedback[];
<<<<<<< HEAD

=======
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  @OneToOne(() => Feedback)
  my_feedback: Feedback;
<<<<<<< HEAD

=======
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  @Column()
  positive_feedbacks_count: number
  @Column()
  negative_feedbacks_count: number
  @Column()
  user_id: number
  @Column()
  product_id: number;
<<<<<<< HEAD

  @ManyToMany(() => Report)
  @JoinTable()
  abusive_reports: Report[];

=======
  @OneToOne(() => Report)
  abusive_reports: Report[];
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
  @Column()
  shop_id: string
  @Column()
  variation_option_id: string
  @Column()
<<<<<<< HEAD
  abusive_reports_count?: number;
  review: { id: number; };
=======
  abusive_reports_count?: number
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f
}
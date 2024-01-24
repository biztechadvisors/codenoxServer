/* eslint-disable prettier/prettier */
import { Product } from 'src/products/entities/product.entity';
import { Question } from '../entities/question.entity';
import { PickType } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';

export class CreateQuestionDto extends PickType(Question, [
  'id',
  'question',
  'answer',
  'shop_id',
  'positive_feedbacks_count',
  'negative_feedbacks_count',
  'user_id',
  'product_id',
  'created_at',
  'updated_at',
]) {
  product: Product;
  user: User;
  feedback: Feedback;
}

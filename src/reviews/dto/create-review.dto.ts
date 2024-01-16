/* eslint-disable prettier/prettier */
import { Attachment } from '../../common/entities/attachment.entity';

export class CreateReviewDto {
  rating: number;
  comment: string;
  photos?: Attachment[];
  product_id: string;
  shop_id: string;
  order_id: string;
  user_id: any;
  variation_option_id: number;
}

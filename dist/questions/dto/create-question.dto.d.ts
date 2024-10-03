import { Product } from 'src/products/entities/product.entity';
import { Question } from '../entities/question.entity';
import { User } from 'src/users/entities/user.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
declare const CreateQuestionDto_base: import("@nestjs/common").Type<Pick<Question, "id" | "shop_id" | "created_at" | "updated_at" | "answer" | "question" | "positive_feedbacks_count" | "negative_feedbacks_count">>;
export declare class CreateQuestionDto extends CreateQuestionDto_base {
    product: Product;
    user: User;
    feedback: Feedback;
}
export {};

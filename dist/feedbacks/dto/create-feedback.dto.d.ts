import { Feedback } from '../entities/feedback.entity';
import { User } from 'src/users/entities/user.entity';
declare const CreateFeedBackDto_base: import("@nestjs/common").Type<Pick<Feedback, "model_id" | "model_type" | "positive" | "negative">>;
export declare class CreateFeedBackDto extends CreateFeedBackDto_base {
    user: User;
    shopSlug: string;
}
export {};

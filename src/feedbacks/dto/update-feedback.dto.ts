import { PickType } from '@nestjs/swagger';
import { Feedback } from '../entities/feedback.entity';
import { User } from 'src/users/entities/user.entity';

export class UpdateFeedBackDto extends PickType(Feedback, [
    'model_id',
    'model_type',
    'positive',
    'negative',
]) {
    user: User;
    shopSlug: string;
}

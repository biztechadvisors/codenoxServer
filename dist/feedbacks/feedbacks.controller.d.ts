import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { FeedbackService } from './feedbacks.service';
export declare class FeedbackController {
    private feedbackService;
    constructor(feedbackService: FeedbackService);
    findAll(shopSlug?: string, search?: string): Promise<import("./entities/feedback.entity").Feedback[]>;
    find(id: number): Promise<import("./entities/feedback.entity").Feedback>;
    create(createFeedBackDto: CreateFeedBackDto): Promise<{
        message: string;
        feedback: import("./entities/feedback.entity").Feedback;
    }>;
    update(id: string, updateFeedBackDto: UpdateFeedBackDto): Promise<import("./entities/feedback.entity").Feedback>;
    delete(id: string): Promise<void>;
}

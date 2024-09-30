import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { FeedbackService } from './feedbacks.service';
import { CacheService } from '../helpers/cacheService';
export declare class FeedbackController {
    private feedbackService;
    private readonly cacheService;
    constructor(feedbackService: FeedbackService, cacheService: CacheService);
    findAll(shopSlug?: string, search?: string): Promise<import("./entities/feedback.entity").Feedback[]>;
    find(id: number): Promise<import("./entities/feedback.entity").Feedback>;
    create(createFeedBackDto: CreateFeedBackDto): Promise<{
        message: string;
        feedback: import("./entities/feedback.entity").Feedback;
    }>;
    update(id: string, updateFeedBackDto: UpdateFeedBackDto): Promise<import("./entities/feedback.entity").Feedback>;
    delete(id: string): Promise<void>;
}

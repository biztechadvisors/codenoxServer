import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { Feedback } from './entities/feedback.entity';
import { Repository } from 'typeorm';
import { Question } from 'src/questions/entities/question.entity';
import { Shop } from 'src/shops/entities/shop.entity';
export declare class FeedbackService {
    private feedbackRepository;
    private questionRepository;
    private shopRepository;
    constructor(feedbackRepository: Repository<Feedback>, questionRepository: Repository<Question>, shopRepository: Repository<Shop>);
    findAllFeedBacks(shopSlug?: string, search?: string): Promise<Feedback[]>;
    findFeedBack(id: number): Promise<Feedback>;
    create(createFeedBackDto: CreateFeedBackDto): Promise<{
        message: string;
        feedback: Feedback;
    }>;
    update(id: number, updateFeedbackDto: UpdateFeedBackDto): Promise<Feedback>;
    delete(id: number): Promise<void>;
}

import { Question } from './entities/question.entity';
import { GetQuestionDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
export declare class QuestionService {
    private questionRepository;
    private productRepository;
    private userRepository;
    private feedbackRepository;
    constructor(questionRepository: Repository<Question>, productRepository: Repository<Product>, userRepository: Repository<User>, feedbackRepository: Repository<Feedback>);
    findAllQuestions({ limit, page, search, answer, product_id, }: GetQuestionDto): Promise<{
        count: number;
        current_page: number;
        firstItem: number;
        lastItem: number;
        last_page: number;
        per_page: number;
        total: number;
        first_page_url: string;
        last_page_url: string;
        next_page_url: string;
        prev_page_url: string;
        Alldata: Question[];
    }>;
    findQuestion(id: number): Promise<Question>;
    create(createQuestionDto: CreateQuestionDto): Promise<Question>;
    update(id: number, updateQuestionDto: UpdateQuestionDto): Promise<Question>;
    delete(id: number): Promise<void>;
}

import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import { Review } from './entities/review.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Report } from './entities/reports.entity';
import { Cache } from 'cache-manager';
export declare class ReviewService {
    private readonly reviewRepository;
    private readonly productRepository;
    private readonly userRepository;
    private readonly shopRepository;
    private readonly feedbackRepository;
    private readonly orderkRepository;
    private readonly reportRepository;
    private readonly cacheManager;
    constructor(reviewRepository: Repository<Review>, productRepository: Repository<Product>, userRepository: Repository<User>, shopRepository: Repository<Shop>, feedbackRepository: Repository<Feedback>, orderkRepository: Repository<Order>, reportRepository: Repository<Report>, cacheManager: Cache);
    private getReviewsFromDatabase;
    private findReviewInDatabase;
    private createReviewInDatabase;
    private updateReviewInDatabase;
    private deleteReviewInDatabase;
    findAllReviews({ limit, page, search, product_id, shopSlug, userId, }: GetReviewsDto): Promise<ReviewPaginator>;
    findReview(id: number): Promise<Review>;
    create(createReviewDto: CreateReviewDto): Promise<Review>;
    update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review>;
    delete(id: number): Promise<void>;
}

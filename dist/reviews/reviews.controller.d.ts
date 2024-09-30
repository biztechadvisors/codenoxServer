import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './reviews.service';
import { CacheService } from '../helpers/cacheService';
export declare class ReviewController {
    private readonly reviewService;
    private readonly cacheService;
    constructor(reviewService: ReviewService, cacheService: CacheService);
    findAll(query: GetReviewsDto): Promise<ReviewPaginator>;
    find(id: string): Promise<import("./entities/review.entity").Review>;
    create(createReviewDto: CreateReviewDto): Promise<import("./entities/review.entity").Review>;
    update(id: string, updateReviewDto: UpdateReviewDto): Promise<import("./entities/review.entity").Review>;
    delete(id: string): Promise<void>;
}

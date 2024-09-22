import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './reviews.service';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    findAll(query: GetReviewsDto): Promise<ReviewPaginator>;
    find(id: string): Promise<import("./entities/review.entity").Review>;
    create(createReviewDto: CreateReviewDto): Promise<import("./entities/review.entity").Review>;
    update(id: string, updateReviewDto: UpdateReviewDto): Promise<import("./entities/review.entity").Review>;
    delete(id: string): Promise<void>;
}

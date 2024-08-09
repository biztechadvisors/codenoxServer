/* eslint-disable prettier/prettier */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { Any, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Order)
    private readonly orderkRepository: Repository<Order>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) { }

  private async getReviewsFromDatabase(): Promise<Review[]> {
    return await this.reviewRepository.find();
  }

  private async findReviewInDatabase(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id: id } });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  private async createReviewInDatabase(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = plainToClass(Review, createReviewDto);

    if (review.product) {
      const getProduct = await this.productRepository.find({
        where: ({ name: review.product.name, slug: review.product.slug }),
      });
      if (getProduct.length > 0) {
        review.product = getProduct[0];
      }
    }
    if (review.user) {
      const getUser = await this.userRepository.find({
        where: ({ name: review.user.name, email: review.user.email }), relations: ['type']
      });
      if (getUser.length > 0) {
        review.user = getUser[0];
      }
    }

    if (review.shop) {
      const getShop = await this.shopRepository.find({
        where: ({ name: review.shop.name, slug: review.shop.slug }),
      });
      if (getShop.length > 0) {
        review.shop = getShop[0];
      }
    }

    if (review.my_feedback) {
      const getFeedback = await this.feedbackRepository.find({
        where: ({ id: review.my_feedback.id }),
      });
      if (getFeedback.length > 0) {
        review.my_feedback = getFeedback[0];
      }
    }

    if (review.order) {
      const getOrder = await this.orderkRepository.find({
        where: ({ id: review.order.id }),
      });
      if (getOrder.length > 0) {
        review.order = getOrder[0];
      }
    }

    if (review.abusive_reports) {
      const getReport = await this.reportRepository.find({
        where: {
          user_id: review.abusive_reports[0].user_id,
          id: review.abusive_reports[0].user_id,
        },
      });

      if (getReport.length > 0) {
        review.abusive_reports = getReport;
        review.abusive_reports_count = getReport.length
      }
    }

    return
    // await this.reviewRepository.save(review);
  }

  private async updateReviewInDatabase(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findReviewInDatabase(id); // Ensure the review exists

    // Update the review entity with the new data
    Object.assign(review, updateReviewDto);

    // Save the updated review to the database
    return await this.reviewRepository.save(review);
  }



  private async deleteReviewInDatabase(id: number): Promise<void> {
    const review = await this.findReviewInDatabase(id);
    await this.reviewRepository.remove(review);
  }

  async findAllReviews({
    limit,
    page,
    search,
    product_id,
    shopSlug,
    userId,
  }: GetReviewsDto): Promise<ReviewPaginator> {
    const cacheKey = `reviews_${shopSlug || 'all'}_${userId || 'all'}_${product_id || 'all'}_${search || 'all'}`;

    let reviews = await this.cacheManager.get<Review[]>(cacheKey);

    if (!reviews) {
      reviews = await this.getReviewsFromDatabase();

      // Apply search filtering if search parameter is provided
      if (search) {
        const parseSearchParams = search.split(';');
        for (const searchParam of parseSearchParams) {
          const [key, value] = searchParam.split(':');
          const options = {
            keys: [key],
            threshold: 0.3,
          };
          const fuse = new Fuse(reviews, options);
          reviews = fuse.search(value)?.map(({ item }) => item) || [];
        }
      }

      // Filter by product ID if provided
      if (product_id) {
        reviews = reviews.filter((p) => p.product_id === Number(product_id));
      }

      // Filter by shopSlug if provided
      if (shopSlug) {
        reviews = reviews.filter((review) => review.shop.slug === shopSlug);
      }

      // Filter by userId if provided
      if (userId) {
        reviews = reviews.filter((review) => review.user.id === userId);
      }

      // Cache the results
      await this.cacheManager.set(cacheKey, reviews, 300); // Cache for 5 minutes
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = reviews.slice(startIndex, endIndex);
    const url = `/reviews?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(reviews.length, page, limit, results.length, url),
    };
  }

  async findReview(id: number): Promise<Review> {
    return await this.findReviewInDatabase(id);
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    return await this.createReviewInDatabase(createReviewDto);
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    return await this.updateReviewInDatabase(id, updateReviewDto);
  }

  async delete(id: number): Promise<void> {
    return await this.deleteReviewInDatabase(id);
  }

}


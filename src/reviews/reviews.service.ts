import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

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
        where: ({ name: review.user.name, email: review.user.email }),
      });
      if (getUser.length > 0) {
        console.log("firstUser", getUser)
        review.user = getUser[0];
      }
    }

    if (review.shop) {
      const getShop = await this.shopRepository.find({
        where: ({ name:review.shop.name, slug:review.shop.slug }),
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

  async findAllReviews({ limit, page, search, product_id }: GetReviewsDto): Promise<ReviewPaginator> {
    let reviews = await this.getReviewsFromDatabase();

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

    if (product_id) {
      reviews = reviews.filter((p) => p.product_id === Number(product_id));
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



// import { Injectable } from '@nestjs/common';
// import { plainToClass } from 'class-transformer';
// import Fuse from 'fuse.js';
// import { paginate } from 'src/common/pagination/paginate';
// import { CreateReviewDto } from './dto/create-review.dto';
// import { UpdateReviewDto } from './dto/update-review.dto';
// import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
// import reviewJSON from '@db/reviews.json';
// import { Review } from './entities/review.entity';

// const reviews = plainToClass(Review, reviewJSON);
// const options = {
//   keys: ['product_id'],
//   threshold: 0.3,
// };
// const fuse = new Fuse(reviews, options);

// @Injectable()
// export class ReviewService {
//   private reviews: Review[] = reviews;

//   findAllReviews({ limit, page, search, product_id }: GetReviewsDto) {
//     if (!page) page = 1;
//     if (!limit) limit = 30;
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     let data: Review[] = this.reviews;

//     if (search) {
//       const parseSearchParams = search.split(';');
//       for (const searchParam of parseSearchParams) {
//         const [key, value] = searchParam.split(':');
//         data = fuse.search(value)?.map(({ item }) => item);
//       }
//     }

//     if (product_id) {
//       data = data.filter((p) => p.product_id === Number(product_id));
//     }

//     const results = data.slice(startIndex, endIndex);
//     const url = `/reviews?search=${search}&limit=${limit}`;
//     return {
//       data: results,
//       ...paginate(data.length, page, limit, results.length, url),
//     };
//   }

//   findReview(id: number) {
//     return this.reviews.find((p) => p.id === id);
//   }

//   create(createReviewDto: CreateReviewDto) {
//     return this.reviews[0];
//   }

//   update(id: number, updateReviewDto: UpdateReviewDto) {
//     return this.reviews[0];
//   }

//   delete(id: number) {
//     return this.reviews[0];
//   }
// }

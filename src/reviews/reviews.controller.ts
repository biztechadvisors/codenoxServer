/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Param,
  Query,
  Put,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './reviews.service';
import { CacheService } from '../helpers/cacheService';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService, private readonly cacheService: CacheService) { }

  @Get()
  async findAll(@Query() query: GetReviewsDto) {
    return this.reviewService.findAllReviews(query);
  }

  //   find one review by ID
  @Get(':id')
  find(@Param('id') id: string) {
    return this.reviewService.findReview(+id);
  }

  //  create a new review
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    await this.cacheService.invalidateCacheBySubstring('reviews')
    return this.reviewService.create(createReviewDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    await this.cacheService.invalidateCacheBySubstring('reviews')
    return this.reviewService.update(+id, updateReviewDto);
  }

  // delete a review
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring('reviews')
    return this.reviewService.delete(+id);
  }
}
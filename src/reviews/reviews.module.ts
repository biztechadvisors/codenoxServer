/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AbusiveReportsController } from './reports.controller';
import { AbusiveReportService } from './reports.service';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Report } from './entities/reports.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';
import { Order } from 'src/orders/entities/order.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../helpers/cacheService';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Report, Product, User, Shop, Feedback, Order]),
  CacheModule.register()
  ],
  controllers: [ReviewController, AbusiveReportsController],
  providers: [ReviewService, AbusiveReportService, CacheService],
})
export class ReviewModule { }
<<<<<<< HEAD
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
=======
import { Module } from '@nestjs/common'
import { AbusiveReportsController } from './reports.controller'
import { AbusiveReportService } from './reports.service'
import { ReviewController } from './reviews.controller'
import { ReviewService } from './reviews.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Review } from './entities/review.entity'
import { Report } from './entities/reports.entity'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

@Module({
  imports: [TypeOrmModule.forFeature([Review, Report, Product, User,Shop,Feedback,Order])],
  controllers: [ReviewController, AbusiveReportsController],
  providers: [ReviewService, AbusiveReportService],
})
export class ReviewModule {}

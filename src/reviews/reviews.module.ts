import { Module } from '@nestjs/common';
import { AbusiveReportsController } from './reports.controller';
import { AbusiveReportService } from './reports.service';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Report } from './entities/reports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Report])],
  controllers: [ReviewController, AbusiveReportsController],
  providers: [ReviewService, AbusiveReportService],
})
export class ReviewModule { }

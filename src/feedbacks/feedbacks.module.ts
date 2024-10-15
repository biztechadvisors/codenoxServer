/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FeedbackController } from './feedbacks.controller';
import { FeedbackService } from './feedbacks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Question } from 'src/questions/entities/question.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheService } from '../helpers/cacheService';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback, Question, User, Shop]),
  CacheModule.register(),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, CacheService],
})
export class FeedbackModule { }

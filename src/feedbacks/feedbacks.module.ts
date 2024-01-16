/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FeedbackController } from './feedbacks.controller';
import { FeedbackService } from './feedbacks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { Question } from 'src/questions/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback,Question])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule { }

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MyQuestionsController } from './my-questions.controller';
import { MyQuestionsService } from './my-questions.service';
import { QuestionController } from './questions.controller';
import { QuestionService } from './questions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Feedback, User, Product])],
  controllers: [QuestionController, MyQuestionsController],
  providers: [QuestionService, MyQuestionsService],
})
export class QuestionModule { }
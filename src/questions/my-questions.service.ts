/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Question } from './entities/question.entity';
import { GetQuestionDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class MyQuestionsService {

  findMyQuestions({ limit, page, search, answer }: GetQuestionDto) {
    if (!page) page = 1;
    if (!limit) limit = 8;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;


    return {}
  }

  findMyQuestion(id: number) {
    return []
  }

  create(createQuestionDto: CreateQuestionDto) {
    return []
  }

  update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return []
  }

  delete(id: number) {
    return []
  }
}
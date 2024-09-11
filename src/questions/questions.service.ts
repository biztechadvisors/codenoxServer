/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Question } from './entities/question.entity';
import { GetQuestionDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Feedback } from 'src/feedbacks/entities/feedback.entity';

@Injectable()
export class QuestionService {

  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) { }

  async findAllQuestions({
    limit = 10,
    page = 1,
    search,
    answer,
    product_id,
  }: GetQuestionDto) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const findquestions = await this.questionRepository.find(); // Assuming questionRepository is a typeorm repository

    for (const question of findquestions) {
      const feedbackCount = await this.feedbackRepository.find({
        where: { model_id: question.id, model_type: 'question' },
      });

      let positiveCount = 0;
      let negativeCount = 0;

      for (const feedback of feedbackCount) {
        const { positive, negative } = feedback;

        if (positive) {
          positiveCount++;
        } else if (negative) {
          negativeCount++;
        }
      }
      question.positive_feedbacks_count = positiveCount;
      question.negative_feedbacks_count = negativeCount;

      if (search) {
        const parseSearchParams = search.split(';');
        for (const searchParam of parseSearchParams) {
          const [key, value] = searchParam.split(':');
          if (!question[key].includes(value)) {
            return null;
          }
        }
      }

      if (product_id && question.product_id !== Number(product_id)) {
        return null;
      }
    }
    const results = findquestions.slice(startIndex, endIndex);
    const url = `/questions?search=${search}&answer=${answer}&limit=${limit}`;

    return {
      Alldata: results,
      ...paginate(findquestions.length, page, limit, results.length, url),
    };
  }

  async findQuestion(id: number) {
    const question = await this.questionRepository.findOne({
      where: { id: id }
    });
    let positiveCount = 0;
    let negativeCount = 0;

    if (question) {
      const feedbackCount = await this.feedbackRepository.find({
        where: { model_id: question.id, model_type: 'question' },
      });

      for (const data of feedbackCount) {
        const { positive, negative } = data
        if (positive) {
          positiveCount++;
        } else if (negative) {
          negativeCount++;
        }

      }
      question.positive_feedbacks_count = positiveCount
      question.negative_feedbacks_count = negativeCount

    }
    return question
  }

  async create(createQuestionDto: CreateQuestionDto) {
    const question = new Question()
    question.question = createQuestionDto.question
    question.answer = createQuestionDto.answer
    question.negative_feedbacks_count = createQuestionDto.negative_feedbacks_count
    question.positive_feedbacks_count = createQuestionDto.positive_feedbacks_count
    question.shop_id = createQuestionDto.shop_id
    // question.user_id = createQuestionDto.user_id
    // question.product_id = createQuestionDto.product_id
    if (createQuestionDto.product) {
      const Product = createQuestionDto.product
      const existingProduct = await this.productRepository.find({
        where: { name: Product.name, product_type: Product.product_type }
      })
      if (existingProduct) {
        for (const data of existingProduct) {
          question.product = data.id
          question.product_id = data.id
        }
      }
    }

    if (createQuestionDto.user) {
      const User = createQuestionDto.user
      const existingUser = await this.userRepository.find({
        where: { name: User.name, email: User.email }, relations: ['type']
      })
      if (existingUser) {
        for (const data of existingUser) {
          question.user = data.id
          question.user_id = data.id
        }
      }
    }

    return await this.questionRepository.save(question)
    // return this.question[0];
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    try {
      const existingQuestion = await this.questionRepository.findOne({
        where: { id }
      });

      if (!existingQuestion) {
        throw new NotFoundException('Question not found');
      }

      existingQuestion.question = updateQuestionDto.question
      existingQuestion.answer = updateQuestionDto.answer
      // existingQuestion.negative_feedbacks_count = updateQuestionDto.negative_feedbacks_count
      // existingQuestion.positive_feedbacks_count = updateQuestionDto.positive_feedbacks_count
      existingQuestion.shop_id = updateQuestionDto.shop_id
      // question.user_id = createQuestionDto.user_id
      // question.product_id = createQuestionDto.product_id
      if (updateQuestionDto.product) {
        const Product = updateQuestionDto.product
        const existingProduct = await this.productRepository.find({
          where: { name: Product.name, product_type: Product.product_type }
        })
        if (existingProduct) {
          for (const data of existingProduct) {
            existingQuestion.product = data.id
            existingQuestion.product_id = data.id
          }
        }
      }

      if (updateQuestionDto.user) {
        const User = updateQuestionDto.user
        const existingUser = await this.userRepository.find({
          where: { name: User.name, email: User.email }, relations: ['type']
        })
        if (existingUser) {
          for (const data of existingUser) {
            existingQuestion.user = data.id
            existingQuestion.user_id = data.id
          }
        }

        return await this.questionRepository.save(existingQuestion)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async delete(id: number) {
    const existingQuestion = await this.questionRepository.findOne({ where: { id } });

    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }
    await this.questionRepository.remove(existingQuestion);
  }
}

/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { UserRepository } from 'src/users/users.repository';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Question } from 'src/questions/entities/question.entity';
import { UpdateQuestionDto } from 'src/questions/dto/update-question.dto';
import { Shop } from 'src/shops/entities/shop.entity';

@Injectable()
export class FeedbackService {

  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,

  ) { }

  async findAllFeedBacks(shopSlug?: string, search?: string) {
    const query = this.feedbackRepository.createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.user', 'user')
      .leftJoinAndSelect('feedback.shop', 'shop');

    if (shopSlug) {
      const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
      if (shop) {
        query.andWhere('feedback.shop_id = :shopId', { shopId: shop.id });
      } else {
        throw new NotFoundException('Shop not found');
      }
    }

    if (search) {
      query.andWhere('feedback.model_type LIKE :search OR feedback.model_id LIKE :search', { search: `%${search}%` });
    }

    return await query.getMany();
  }


  async findFeedBack(id: number) {
    return await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user']
    })
  }

  async create(createFeedBackDto: CreateFeedBackDto) {
    const feedback = new Feedback();
    feedback.model_id = createFeedBackDto.model_id;
    feedback.model_type = createFeedBackDto.model_type;
    feedback.negative = createFeedBackDto.negative;
    feedback.positive = createFeedBackDto.positive;
    feedback.user = createFeedBackDto.user;

    if (createFeedBackDto.shopSlug) {
      const shop = await this.shopRepository.findOne({ where: { slug: createFeedBackDto.shopSlug } });
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }
      feedback.shop = shop;
    }

    if (feedback.positive || feedback.negative) {
      const question = await this.questionRepository.findOne({
        where: { id: createFeedBackDto.model_id },
      });

      if (question) {
        if (feedback.positive) {
          question.positive_feedbacks_count += 1;
        } else if (feedback.negative) {
          question.negative_feedbacks_count += 1;
        }
        await this.questionRepository.save(question);
      }
    }
    await this.feedbackRepository.save(feedback);
    return {
      message: 'Feedback created successfully',
      feedback,
    };
  }

  async update(id: number, updateFeedbackDto: UpdateFeedBackDto) {
    const existingFeedback = await this.feedbackRepository.findOne({ where: { id } });
    if (existingFeedback) {
      existingFeedback.model_id = updateFeedbackDto.model_id;
      existingFeedback.model_type = updateFeedbackDto.model_type;
      existingFeedback.negative = updateFeedbackDto.negative;
      existingFeedback.positive = updateFeedbackDto.positive;
      existingFeedback.user = updateFeedbackDto.user;

      if (updateFeedbackDto.shopSlug) {
        const shop = await this.shopRepository.findOne({ where: { slug: updateFeedbackDto.shopSlug } });
        if (!shop) {
          throw new NotFoundException('Shop not found');
        }
        existingFeedback.shop = shop;
      }

      return await this.feedbackRepository.save(existingFeedback);
    }
    throw new NotFoundException('Feedback not found');
  }

  async delete(id: number) {
    const existingFeedback = await this.feedbackRepository.findOne({ where: { id } });

    if (!existingFeedback) {
      throw new NotFoundException('Feedback not found');
    }
    await this.feedbackRepository.remove(existingFeedback);
  }
}

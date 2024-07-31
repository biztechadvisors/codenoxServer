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

@Injectable()
export class FeedbackService {

  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) { }

  async findAllFeedBacks() {
    return await this.feedbackRepository.find({
      relations: ['user']
    })
  }

  async findFeedBack(id: number) {
    return await this.feedbackRepository.findOne({
      where: { id },
      relations: ['user']
    })
  }

  async create(
    createFeedBackDto: CreateFeedBackDto,
  ) {

    const feedback = new Feedback();
    feedback.model_id = createFeedBackDto.model_id;
    feedback.model_type = createFeedBackDto.model_type;
    feedback.negative = createFeedBackDto.negative;
    feedback.positive = createFeedBackDto.positive;
    feedback.user = createFeedBackDto.user;

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
    const existingFeedback = await this.feedbackRepository.findOne({
      where: { id }
    })
    if (existingFeedback) {
      existingFeedback.model_id = updateFeedbackDto.model_id
      existingFeedback.model_type = updateFeedbackDto.model_type
      existingFeedback.negative = updateFeedbackDto.negative
      existingFeedback.positive = updateFeedbackDto.positive
      existingFeedback.user = updateFeedbackDto.user

      return await this.feedbackRepository.save(existingFeedback)

    }
  }

  async delete(id: number) {
    const existingFeedback = await this.feedbackRepository.findOne({ where: { id } });

    if (!existingFeedback) {
      throw new NotFoundException('Feedback not found');
    }
    await this.feedbackRepository.remove(existingFeedback);
  }
}

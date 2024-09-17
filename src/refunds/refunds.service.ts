import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund } from './entities/refund.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class RefundsService {
  constructor(
    private readonly analyticsService: AnalyticsService,

    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
  ) { }

  async create(createRefundDto: CreateRefundDto): Promise<Refund> {
    try {
      const refund = this.refundRepository.create(createRefundDto);

      // Save the refund first
      await this.refundRepository.save(refund);

      // Update analytics with the refund information
      // await this.analyticsService.updateAnalytics(undefined, refund);

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new InternalServerErrorException('An error occurred while creating the refund.');
    }
  }

  async findAll(): Promise<Refund[]> {
    return this.refundRepository.find();
  }

  async findOne(id: number): Promise<Refund> {
    const refund = await this.refundRepository.findOne({ where: { id } });
    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found`);
    }
    return refund;
  }

  async update(id: number, updateRefundDto: UpdateRefundDto): Promise<Refund> {
    const refund = await this.refundRepository.preload({
      id,
      ...updateRefundDto,
    });

    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found`);
    }

    return this.refundRepository.save(refund);
  }

  async remove(id: number): Promise<void> {
    const result = await this.refundRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Refund with ID ${id} not found`);
    }
  }
}

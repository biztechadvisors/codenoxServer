import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import { Refund } from './entities/refund.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { Shop } from '../shops/entities/shop.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RefundsService {
  constructor(
    private readonly analyticsService: AnalyticsService,

    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  // Create a refund and associate it with customer, order, and shop if present
  async create(createRefundDto: CreateRefundDto): Promise<Refund> {
    const { shopId, orderId, customerId } = createRefundDto;

    try {
      // Find the shop if shopId is provided
      let shop = null;
      if (shopId) {
        shop = await this.shopRepository.findOne({ where: { id: shopId } });
        if (!shop) {
          throw new NotFoundException(`Shop with ID ${shopId} not found.`);
        }
      }

      // Find the order if orderId is provided
      let order = null;
      if (orderId) {
        order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
          throw new NotFoundException(`Order with ID ${orderId} not found.`);
        }
      }

      // Find the customer if customerId is provided
      let customer = null;
      if (customerId) {
        customer = await this.userRepository.findOne({ where: { id: customerId } });
        if (!customer) {
          throw new NotFoundException(`Customer with ID ${customerId} not found.`);
        }
      }

      // Create the refund and associate it with the order, shop, and customer
      const refund = this.refundRepository.create({
        ...createRefundDto,
        shop,
        order,
        customer,
      });

      // Save the refund
      await this.refundRepository.save(refund);

      // Update analytics with the refund information
      await this.analyticsService.updateAnalytics(undefined, refund);

      return refund;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw new InternalServerErrorException('An error occurred while creating the refund.');
    }
  }

  async findAll(): Promise<Refund[]> {
    return this.refundRepository.find({ relations: ['shop', 'order', 'customer'] });
  }

  async findOne(id: number): Promise<Refund> {
    const refund = await this.refundRepository.findOne({
      where: { id },
      relations: ['shop', 'order', 'customer'],
    });
    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found.`);
    }
    return refund;
  }

  async update(id: number, updateRefundDto: UpdateRefundDto): Promise<Refund> {
    const refund = await this.refundRepository.preload({
      id,
      ...updateRefundDto,
    });

    if (!refund) {
      throw new NotFoundException(`Refund with ID ${id} not found.`);
    }

    return this.refundRepository.save(refund);
  }

  async remove(id: number): Promise<void> {
    const result = await this.refundRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Refund with ID ${id} not found.`);
    }
  }
}

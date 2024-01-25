// analytics.service.ts

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { AnalyticsResponseDTO, TotalYearSaleByMonthDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { Dealer } from 'src/users/entities/dealer.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
    @InjectRepository(TotalYearSaleByMonth)
    private readonly totalYearSaleByMonthRepository: Repository<TotalYearSaleByMonth>,
  ) { }

  async findAll(): Promise<AnalyticsResponseDTO> {
    const totalRevenue = await this.calculateTotalRevenue();
    const totalRefunds = await this.calculateTotalRefunds();
    const totalShops = await this.calculateTotalShops();
    const todaysRevenue = await this.calculateTodaysRevenue();
    const totalOrders = await this.calculateTotalOrders();
    const newCustomers = await this.calculateNewCustomers();

    const totalYearSaleByMonth = await this.calculateTotalYearSaleByMonth();

    const analyticsResponse: AnalyticsResponseDTO = {
      totalRevenue,
      totalRefunds,
      totalShops,
      todaysRevenue,
      totalOrders,
      newCustomers,
      totalYearSaleByMonth,
    };

    return analyticsResponse;
  }

  private async calculateTotalRevenue(): Promise<number> {
    const orders = await this.orderRepository.find();
    return orders.reduce((sum, order) => sum + order.total, 0);
  }

  private async calculateTotalRefunds(): Promise<number> {
    return 0;
  }

  private async calculateTotalShops(): Promise<number> {
    const totalShops = await this.shopRepository
      .createQueryBuilder('shop')
      .select('COUNT(DISTINCT shop.id)', 'totalShops')
      .getRawOne()
      .then(result => result.totalShops || 0);

    return totalShops;
  }

  private async calculateTodaysRevenue(): Promise<number> {

    // Get the start and end of today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Query orders placed today
    const todayOrders = await this.orderRepository.find({
      where: {
        created_at: Between(todayStart, todayEnd),
      },
    });

    // Calculate total revenue from today's orders
    const todayRevenue = todayOrders.reduce((total, order) => total + order.total, 0);

    return todayRevenue;
  }

  private async calculateTotalOrders(): Promise<number> {
    return this.orderRepository.count();
  }

  private async calculateNewCustomers(): Promise<number> {

    // Assuming "new customer" means created within the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Query shops created within the last 30 days
    const newShops = await this.shopRepository.find({
      where: {
        created_at: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    // Count the number of new shops (new customers)
    const numberOfNewCustomers = newShops.length;

    return numberOfNewCustomers;
  }

  private async calculateTotalYearSaleByMonth(): Promise<TotalYearSaleByMonthDTO[]> {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return await Promise.all(
      months.map(async (month, index) => {
        const total = await this.calculateTotalSalesForMonth(index + 1); // Assuming 1-based month index
        return { total, month };
      }),
    );
  }

  private async calculateTotalSalesForMonth(month: number): Promise<number> {
    const firstDayOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const lastDayOfMonth = new Date(new Date().getFullYear(), month, 0, 23, 59, 59, 999);

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(`order`.total)', 'total')
      .where('`order`.created_at BETWEEN :firstDay AND :lastDay', {
        firstDay: firstDayOfMonth.toISOString().slice(0, 19).replace("T", " "), // Format date for MySQL
        lastDay: lastDayOfMonth.toISOString().slice(0, 19).replace("T", " "),  // Format date for MySQL
      })
      .getRawOne();

    return parseInt(orders.total) || 0;
  }

  // async calculateOrderByODSC(filters: Record<string, any>): Promise<{ month: string; orderCount: number }[]> {
  //   const queryBuilder = this.orderRepository.createQueryBuilder('order');
  //   queryBuilder.leftJoinAndSelect('order.shipping_address', 'shipping_address');

  //   // Add filters based on your criteria
  //   if (filters.zip) {
  //     queryBuilder.andWhere('shipping_address.zip = :zip', { zip: filters.zip });
  //   }

  //   if (filters.state) {
  //     queryBuilder.andWhere('shipping_address.state = :state', { state: filters.state });
  //   }

  //   if (filters.dealer) {
  //     queryBuilder.andWhere('order.customer.dealer.name = :dealer', { dealer: filters.dealer });
  //   }

  //   if (filters.shop_id) {
  //     queryBuilder.andWhere('order.shop_id = :shop_id', { shop_id: filters.shop_id });
  //   }

  //   if (filters.customer_id) {
  //     queryBuilder.andWhere('order.customer.id = :customer_id', { customer_id: filters.customer_id });
  //   }

  //   // Add grouping by month and counting
  //   queryBuilder.select('DATE_FORMAT(order.created_at, "%Y-%m") AS month');
  //   queryBuilder.addSelect('COUNT(order.id) AS orderCount');
  //   queryBuilder.groupBy('month');

  //   const result = await queryBuilder.getRawMany();

  //   // Transform the result if needed
  //   return result.map(item => ({ month: item.month, orderCount: parseInt(item.orderCount) }));
  // }

  async calculateOrderByODSC(filters: Record<string, any>): Promise<{ month: string; orderCount: number }[]> {
    try {
      const queryBuilder = this.orderRepository.createQueryBuilder('order');
      queryBuilder.leftJoinAndSelect('order.shipping_address', 'shipping_address');

      // Add filters based on your criteria
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          if (key === 'startDate') {
            queryBuilder.andWhere(`order.created_at >= :${key}`, { [key]: filters[key] });
          } else {
            queryBuilder.andWhere(`${key} = :${key}`, { [key]: filters[key] });
          }
        }
      });

      // Add grouping by month and counting, considering only the filtered orders
      queryBuilder.select('DATE_FORMAT(order.created_at, "%Y-%m") AS month');
      queryBuilder.addSelect('COUNT(order.id) AS orderCount');
      queryBuilder.groupBy('month');

      const result = await queryBuilder.getRawMany();

      // Transform the result if needed
      return result.map(item => ({ month: item.month, orderCount: parseInt(item.orderCount) }));
    } catch (error) {
      throw new Error(`Failed to calculate order by ODSC: ${error.message}`);
    }
  }

}

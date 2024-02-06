// analytics.service.ts

import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { AnalyticsResponseDTO, TotalYearSaleByMonthDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Address } from 'src/addresses/entities/address.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { User, UserType } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';

@Injectable()
export class AnalyticsService {
  refundRepository: any;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
    @InjectRepository(TotalYearSaleByMonth)
    private readonly totalYearSaleByMonthRepository: Repository<TotalYearSaleByMonth>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }

  async findAll(customerId: number): Promise<AnalyticsResponseDTO> {
    try {
      // Find the user by ID
      const user = await this.userRepository.findOne({ where: { id: customerId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${customerId} not found`);
      }

      // Check if the user is Super_Admin or Admin
      if (![UserType.Super_Admin, UserType.Admin].includes(user.type)) {
        throw new ForbiddenException(`User with ID ${customerId} does not have permission to access analytics`);
      }

      // Calculate various analytics metrics based on user type
      const totalRevenue = await this.calculateTotalRevenue(user.id, user.type);
      const totalRefunds = await this.calculateTotalRefunds();
      const totalShops = await this.calculateTotalShops();
      const todaysRevenue = await this.calculateTodaysRevenue(user.id, user.type);
      const totalOrders = await this.calculateTotalOrders(user.id, user.type);
      const newCustomers = await this.calculateNewCustomers(user.id, user.type);
      const totalYearSaleByMonth = await this.calculateTotalYearSaleByMonth(user.id, user.type);

      // Create analytics response object
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
    } catch (error) {
      // Log error or handle appropriately
      throw new NotFoundException(`Error fetching analytics: ${error.message}`);
    }
  }

  private async calculateTotalRevenue(userId: number, userType: UserType): Promise<number> {
    // Find the user by userId
    const user = await this.userRepository.findOne({ where: { id: userId } });

    // Find all users in the repository based on user IDs
    const users = await this.userRepository.find({
      where: { UsrBy: { id: user.id } },
    });

    // Extract user IDs from users and include the original user ID
    const userIds = [user.id, ...users.map(u => u.id)];

    let orders;

    if (userType === UserType.Super_Admin || UserType.Admin) {
      // No need to filter by customer_id for Super_Admin
      // Fetch all orders
      orders = await this.orderRepository.find();
    } else {
      // Filter orders by customer_id for other user types
      orders = await this.orderRepository.find({ where: { customer_id: In(userIds) } });
    }

    // Calculate total revenue from orders
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return totalRevenue;
  }


  private async calculateTotalRefunds(): Promise<number> {
    // const refunds = await this.refundRepository.find({});

    // Calculate total refunds
    // const totalRefunds = refunds.reduce((sum, refund) => sum + refund.amount, 0);

    // return totalRefunds;
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

  private async calculateTodaysRevenue(customerId: number, userType: UserType): Promise<number> {
    try {
      // Find the user by customer_id
      const user = await this.userRepository.findOne({ where: { id: customerId } });

      // Find all users in the repository based on user IDs
      const users = await this.userRepository.find({
        where: { UsrBy: { id: user.id } },
      });

      // Extract user IDs from users and include the original user ID
      const userIds = [user.id, ...users.map(u => u.id)];

      // Get the start and end of today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      let todayOrders;

      if (userType === UserType.Super_Admin || userType === UserType.Admin) {
        // No need to filter by customer_id for Super_Admin and Admin
        // Fetch all orders placed today
        todayOrders = await this.orderRepository.find({
          where: {
            created_at: Between(todayStart, todayEnd),
          },
        });
      } else {
        // Filter orders by customer_id for other user types
        todayOrders = await this.orderRepository.find({
          where: {
            created_at: Between(todayStart, todayEnd),
            customer_id: In(userIds),
          },
        });
      }

      // Calculate total revenue from today's orders
      const todayRevenue = todayOrders.reduce((total, order) => total + order.total, 0);

      return todayRevenue;
    } catch (error) {
      console.error('Error calculating today\'s revenue:', error.message);
      return 0; // Handle the error gracefully, return 0 or throw an appropriate exception
    }
  }


  private async calculateTotalOrders(customerId: number, userType: UserType): Promise<number> {
    // Find the user by customer_id
    const usr = await this.userRepository.findOne({ where: { id: customerId } });

    // Find all users in the repository based on user IDs
    const usrByIdUsers = await this.userRepository.find({
      where: { UsrBy: { id: usr.id } },
    });

    // Extract user IDs from usrByIdUsers and include the original user ID
    const userIds = [usr.id, ...usrByIdUsers.map(user => user.id)];

    let query = this.orderRepository.createQueryBuilder('order');

    if (userType === UserType.Super_Admin || UserType.Admin) {
      // No need to filter by customer_id for Super_Admin
      // Just count all orders
      return query.getCount();
    } else {
      // Filter by customer_id for other user types
      query = query.where('order.customer_id IN (:...userIds)', { userIds });
      return query.getCount();
    }
  }

  private async calculateNewCustomers(userId: number, userType: UserType): Promise<number> {
    try {
      // Assuming "new customer" means created within the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let newShops;

      if (userType === UserType.Super_Admin || userType === UserType.Admin) {
        // For Super_Admin and Admin, fetch all new shops created within the last 30 days
        newShops = await this.shopRepository.find({
          where: {
            created_at: MoreThanOrEqual(thirtyDaysAgo),
          },
        });
      } else {
        // For other user types, filter new shops based on user's ownership
        newShops = await this.shopRepository.find({
          where: {
            created_at: MoreThanOrEqual(thirtyDaysAgo),
            owner: { id: userId },
          },
        });
      }

      // Count the number of new shops (new customers)
      const numberOfNewCustomers = newShops.length;

      return numberOfNewCustomers;
    } catch (error) {
      console.error('Error calculating new customers:', error.message);
      return 0; // Handle the error gracefully, return 0 or throw an appropriate exception
    }
  }

  private async calculateTotalYearSaleByMonth(userId: number, userType: UserType): Promise<TotalYearSaleByMonthDTO[]> {
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
        const total = await this.calculateTotalSalesForMonth(index + 1, userId, userType); // Assuming 1-based month index
        return { total, month };
      }),
    );
  }

  private async calculateTotalSalesForMonth(month: number, customerId: number, userType: UserType): Promise<number> {
    const firstDayOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const lastDayOfMonth = new Date(new Date().getFullYear(), month, 0, 23, 59, 59, 999);

    let query = this.orderRepository.createQueryBuilder('order');

    // Adjust the query based on user type and their related users
    if (userType !== UserType.Super_Admin) {
      // Find the user by customerId
      const user = await this.userRepository.findOne({ where: { id: customerId } });

      // Find all users in the repository based on user IDs
      const usrByIdUsers = await this.userRepository.find({
        where: { UsrBy: { id: user.id } },
      });

      // Extract user IDs from usrByIdUsers and include the original user ID
      const userIds = [user.id, ...usrByIdUsers.map(u => u.id)];

      // Filter by customer_id for other user types
      query = query.where('order.customer_id IN (:...userIds)', { userIds });
    }

    const orders = await query
      .select('SUM(order.total)', 'total')
      .where('order.created_at BETWEEN :firstDay AND :lastDay', {
        firstDay: firstDayOfMonth.toISOString().slice(0, 19).replace("T", " "), // Format date for MySQL
        lastDay: lastDayOfMonth.toISOString().slice(0, 19).replace("T", " "),  // Format date for MySQL
      })
      .getRawOne();

    return parseInt(orders.total, 10) || 0;
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

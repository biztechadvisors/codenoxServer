// analytics.service.ts

import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { AnalyticsResponseDTO, TotalYearSaleByMonthDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Address, UserAddress } from 'src/addresses/entities/address.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { User, UserType } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { UserAddressRepository } from 'src/addresses/addresses.repository';
import { error } from 'console';

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
    @InjectRepository(UserAddress) private readonly: UserAddressRepository,
  ) { }

  async findAll(customerId: number, state: string): Promise<AnalyticsResponseDTO> {
    try {
      const user = await this.userRepository.findOne({ where: { id: customerId }, relations: ['type'] });
      console.log("customerId*******", user)

      if (!user) {
        throw new NotFoundException(`User with ID ${customerId} not found`);
      }

      const userPermissions = await this.permissionRepository.findOne({
        where: { permission_name: user.type.permission_name },
      });
      console.log("userPermissions***", userPermissions)
      if (!(userPermissions && ['Admin', 'super_admin', 'dealer', 'Vendor'].includes(userPermissions.type_name))) {
        throw new ForbiddenException(`User with ID ${customerId} does not have permission to access analytics`);
      }

      const analyticsResponse: AnalyticsResponseDTO = {
        totalRevenue: await this.calculateTotalRevenue(user.id, userPermissions.type_name, state),
        totalRefunds: await this.calculateTotalRefunds(userPermissions.type_name, state),
        totalShops: await this.calculateTotalShops(user.id, userPermissions.type_name, state),
        todaysRevenue: await this.calculateTodaysRevenue(user.id, userPermissions.type_name, state),
        totalOrders: await this.calculateTotalOrders(user.id, userPermissions.type_name, state),
        newCustomers: await this.calculateNewCustomers(user.id, userPermissions.type_name, state),
        totalYearSaleByMonth: await this.calculateTotalYearSaleByMonth(user.id, userPermissions.type_name, state),
      };

      console.log("customerId*******", user)
      return analyticsResponse;
    } catch (error) {
      throw new NotFoundException(`Error fetching analytics: ${error.message}`);
    }
  }

  private async calculateTotalRevenue(userId: number, permissionName: string, state: string): Promise<number> {

    const usrByIdUsers = await this.userRepository.find({
      where: { UsrBy: { id: userId } },
    });

    const userIds = [userId, ...usrByIdUsers.map(u => u.id)];

    let query = this.orderRepository.createQueryBuilder('order');

    if (state && state.trim() !== '') {
      if (permissionName === 'super_admin' || permissionName === 'Admin') {
        query = query
          .innerJoin('order.shipping_address', 'shipping_address')
          .where('shipping_address.state = :state', { state });
      } else {
        query = query
          .innerJoin('order.shipping_address', 'shipping_address')
          .where('order.customer_id IN (:...userIds) AND shipping_address.state = :state', { userIds, state });
      }
    }

    const orders = await query.getMany();
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    return totalRevenue;
  }

  private async calculateTotalRefunds(permissionName: string, state: string): Promise<number> {
    try {
      let query = this.refundRepository.createQueryBuilder('refund');

      if (state && state.trim() !== '') {
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
        } else {
          query = query
            .innerJoin('refund.order', 'order')
            .innerJoin('order.shipping_address', 'shipping_address')
            .where('shipping_address.state = :state', { state });
        }
      }

      const totalRefunds = await query
        .select('COUNT(DISTINCT refund.id)', 'totalRefunds')
        .getRawOne()
        .then(result => result.totalRefunds || 0);

      return totalRefunds;
    } catch (error) {
      console.error('Error calculating total refunds:', error.message);
      return 0;
    }
  }

  private async calculateTotalShops(userId: number, permissionName: string, state: string): Promise<number> {
    try {

      if (permissionName !== 'super_admin' && permissionName !== 'Admin') {
        return 0;
      }

      const queryBuilder: SelectQueryBuilder<Shop> = this.shopRepository.createQueryBuilder('shop')
        .innerJoin('shop.owner', 'owner')
        .innerJoin('shop.address', 'address')
        .andWhere('(owner.UsrBy.id = :userId OR shop.owner_id = :userId)', { userId });

      if (state && state.trim() !== '') {
        queryBuilder.andWhere('address.state = :state', { state });
      }

      const totalShops = await queryBuilder.getCount();

      return totalShops;
    } catch (error) {
      console.error('Error calculating total shops:', error.message);
      return 0;
    }
  }


  private async calculateTodaysRevenue(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const users = await this.userRepository.find({ where: { UsrBy: { id: userId } } });

      const userIds = [userId, ...users.map((u) => u.id)];

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      let queryBuilder: SelectQueryBuilder<Order> = this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.shipping_address', 'shipping_address')
        .where('created_at BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd });

      if (state && state.trim() !== '') {
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
          queryBuilder.andWhere('shipping_address.state = :state', { state });
        } else {
          queryBuilder.andWhere('shipping_address.state = :state AND order.customer_id IN (:userIds)', {
            state,
            userIds,
          });
        }
      } else if (permissionName !== 'super_admin' && permissionName !== 'Admin') {
        queryBuilder.andWhere('order.customer_id IN (:userIds)', { userIds });
      }

      const todayOrders = await queryBuilder.getMany();
      const todayRevenue = todayOrders.reduce((total, order) => total + order.total, 0);

      return todayRevenue;
    } catch (error) {
      console.error("Error calculating today's revenue:", error.message);
      return 0;
    }
  }

  private async calculateTotalOrders(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const usrByIdUsers = await this.userRepository.find({
        where: { UsrBy: { id: userId } },
      });

      const userIds = [userId, ...usrByIdUsers.map((usr) => usr.id)];

      let query = this.orderRepository.createQueryBuilder('order');

      if (state && state.trim() !== '') {
        query = query.innerJoin('order.shipping_address', 'shipping_address').where(
          (qb) => {
            qb.where('shipping_address.state = :state', { state });

            if (!(permissionName === 'super_admin' || permissionName === 'Admin')) {
              qb.andWhere('order.customer_id IN (:...userIds)', { userIds });
            }
          }
        );
      } else if (!(permissionName === 'super_admin' || permissionName === 'Admin')) {
        query = query.innerJoin('order.shipping_address', 'shipping_address').where(
          'order.customer_id IN (:...userIds)',
          { userIds }
        );
      }

      const totalOrders = await query.getCount();
      return totalOrders;
    } catch (error) {
      console.error('Error calculating total orders:', error.message);
      return 0;
    }
  }

  private async calculateNewCustomers(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let query = this.shopRepository.createQueryBuilder('shop').where({
        created_at: MoreThanOrEqual(thirtyDaysAgo),
      });

      if (permissionName !== 'super_admin' && permissionName !== 'Admin') {
        query = query.andWhere('shop.owner.id = :userId', { userId });

        if (state && state.trim() !== '') {
          query = query.andWhere('shop.shipping_address.state = :state', { state });
        }
      } else if (state && state.trim() !== '') {
        query = query.andWhere('shop.shipping_address.state = :state', { state });
      }

      const newShops = await query.getMany();
      const numberOfNewCustomers = newShops.length;

      return numberOfNewCustomers;
    } catch (error) {
      console.error('Error calculating new customers:', error.message);
      return 0;
    }
  }

  private async calculateTotalYearSaleByMonth(userId: number, permissionName: string, state: string): Promise<TotalYearSaleByMonthDTO[]> {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    return await Promise.all(
      months.map(async (month, index) => {
        const total = await this.calculateTotalSalesForMonth(index + 1, userId, permissionName, state);
        return { total, month };
      }),
    );
  }

  private async calculateTotalSalesForMonth(month: number, userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const firstDayOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
      const lastDayOfMonth = new Date(new Date().getFullYear(), month, 0, 23, 59, 59, 999);

      let query = this.orderRepository.createQueryBuilder('order')
        .innerJoin('order.shipping_address', 'shipping_address')
        .where('order.created_at BETWEEN :firstDay AND :lastDay', {
          firstDay: firstDayOfMonth,
          lastDay: lastDayOfMonth,
        });

      const usrByIdUsers = await this.userRepository.find({ where: { UsrBy: { id: userId } } });
      const userIds = [userId, ...usrByIdUsers.map((usr) => usr.id)];

      if (state && state.trim() !== '') {
        if (permissionName !== 'super_admin' && permissionName !== 'Admin') {
          query.andWhere('order.customer_id IN (:...userIds) AND shipping_address.state = :state', { userIds, state });
        } else {
          query.andWhere('shipping_address.state = :state', { state });
        }
      } else if (permissionName !== 'super_admin' && permissionName !== 'Admin') {
        query.andWhere('order.customer_id IN (:...userIds)', { userIds });
      }

      const result = await query
        .select('SUM(order.total)', 'total')
        .getRawOne();

      return parseInt(result.total, 10) || 0;
    } catch (error) {
      console.error(`Error calculating total sales for month ${month}: ${error.message}`);
      return 0;
    }
  }


  async getTopUsersWithMaxOrders(userId: number): Promise<{ user: User; orderCount: number }[]> {
    try {

      const queryBuilder = this.userRepository.createQueryBuilder('user')
        .select(['user.id', 'user.name', 'COUNT(order.id) AS orderCount'])
        .leftJoin('user.orders', 'order')

      if (userId) {
        const usrByIdUsers = await this.userRepository.find({
          where: { UsrBy: { id: userId } },
        });
        const userIds = [userId, ...usrByIdUsers.map(u => u.id)];
        if (userIds.length > 0) {
          queryBuilder.where('order.customer IN (:...userIds)', { userIds });
        }
      }

      const topUsers = await queryBuilder
        .groupBy('user.id')
        .having('orderCount > 0') // Exclude users with no orders
        .orderBy('orderCount', 'DESC')
        .take(10) // Change this value to get the desired number of top users
        .getRawMany();

      return topUsers;
    } catch (error) {
      console.error('Error getting top users with max orders:', error.message);
      return [];
    }
  }

  async getTopDealersWithMaxOrders(userId?: number): Promise<any[]> {
    try {
      // Step 1: Get all users with dealer role
      let dealerUsersQuery;
      if (userId) {
        dealerUsersQuery = (await this.userRepository.find({ where: { UsrBy: { id: Number(userId) } }, relations: ['dealer'] })).filter((dlr) => dlr.dealer !== null).flatMap((usr) => usr.id)
      } else {
        dealerUsersQuery = (await this.userRepository.find({ relations: ['dealer'] })).filter((dlr) => dlr.dealer !== null).flatMap((usr) => usr.id)
      }
      console.log("dealerUsersQuery**********", dealerUsersQuery)
      // Step 2: Get all users by matching UsrBy field to dealers' user ids
      const usrByDealer = (await this.orderRepository.find({ relations: ['customer', 'customer.UsrBy'] }))
        .filter((ordUsr) => dealerUsersQuery.includes(ordUsr.customer.UsrBy.id));

      console.log("usrByDealer*************", usrByDealer.length);

      // Step 3: Filter orders by the dealerUsersQuery array
      const ordersByDealers = await this.orderRepository.find({
        relations: ['customer', 'customer.UsrBy'],
        where: {
          customer: {
            UsrBy: {
              id: dealerUsersQuery,
            },
          },
        },
      });

      // Step 4: Calculate order count for each dealer's user
      const orderCountByDealerUser = ordersByDealers.reduce((acc, ordUsr) => {
        const userId = ordUsr.customer.UsrBy.id;
        acc.set(userId, (acc.get(userId) || 0) + 1);
        return acc;
      }, new Map<number, number>());

      // Step 5: Sort dealers based on order count in descending order
      const sortedDealers = Array.from(orderCountByDealerUser.entries())
        .sort((a, b) => b[1] - a[1]);

      // Step 6: Extract dealer user ids from the sorted dealers
      const topDealerUserIds = sortedDealers.map(([userId]) => userId);

      console.log("Order Count by Dealer's User: ", orderCountByDealerUser);

      // If you want to get the top 5 dealers, you can slice the array
      console.log("Top 5 Dealers with Max Orders: ", topDealerUserIds.slice(0, 5));

      return topDealerUserIds.slice(0, 5);
    } catch (error) {
      console.error('Error getting top dealers with max orders:', error.message);
      return [];
    }
  }

  // async calculateOrderByODSC(filters: Record<string, any>): Promise<{ month: string; orderCount: number }[]> {
  //   try {
  //     const queryBuilder = this.orderRepository.createQueryBuilder('order');
  //     queryBuilder.leftJoinAndSelect('order.shipping_address', 'shipping_address');

  //     Object.keys(filters).forEach((key) => {
  //       if (filters[key]) {
  //         if (key === 'startDate') {
  //           queryBuilder.andWhere(`order.created_at >= :${key}`, { [key]: filters[key] });
  //         } else {
  //           queryBuilder.andWhere(`${key} = :${key}`, { [key]: filters[key] });
  //         }
  //       }
  //     });

  //     queryBuilder.select('DATE_FORMAT(order.created_at, "%Y-%m") AS month');
  //     queryBuilder.addSelect('COUNT(order.id) AS orderCount');
  //     queryBuilder.groupBy('month');

  //     const result = await queryBuilder.getRawMany();

  //     return result.map(item => ({ month: item.month, orderCount: parseInt(item.orderCount) }));
  //   } catch (error) {
  //     throw new Error(`Failed to calculate order by ODSC: ${error.message}`);
  //   }
  // }
}

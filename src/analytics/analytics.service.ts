// analytics.service.ts

import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { AnalyticsResponseDTO, TotalYearSaleByMonthDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { Address, UserAddress } from 'src/addresses/entities/address.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { User, UserType } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { UserAddressRepository } from 'src/addresses/addresses.repository';

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
      const user = await this.userRepository.findOne({ where: { id: customerId } });

      if (!user) {
        throw new NotFoundException(`User with ID ${customerId} not found`);
      }

      const userPermissions = await this.permissionRepository.findOne({
        where: { permission_name: user.type },
      });

      if (!(userPermissions && ['Admin', 'super_admin', 'Dealer', 'Vendor'].includes(userPermissions.type_name))) {
        throw new ForbiddenException(`User with ID ${customerId} does not have permission to access analytics`);
      }

      console.log("user.id, userPermissions.type_name, state", user.id, userPermissions.type_name, state)
      const analyticsResponse: AnalyticsResponseDTO = {
        totalRevenue: await this.calculateTotalRevenue(user.id, userPermissions.type_name, state),
        totalRefunds: await this.calculateTotalRefunds(userPermissions.type_name, state),
        totalShops: await this.calculateTotalShops(userPermissions.type_name, state),
        todaysRevenue: await this.calculateTodaysRevenue(user.id, userPermissions.type_name, state),
        totalOrders: await this.calculateTotalOrders(user.id, userPermissions.type_name, state),
        newCustomers: await this.calculateNewCustomers(user.id, userPermissions.type_name, state),
        totalYearSaleByMonth: await this.calculateTotalYearSaleByMonth(user.id, userPermissions.type_name, state),
      };

      return analyticsResponse;
    } catch (error) {
      throw new NotFoundException(`Error fetching analytics: ${error.message}`);
    }
  }

  private async calculateTotalRevenue(userId: number, permissionName: string, state: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const usrByIdUsers = await this.userRepository.find({
      where: { UsrBy: { id: user.id } },
    });

    const userIds = [user.id, ...usrByIdUsers.map(u => u.id)];

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

  private async calculateTotalShops(permissionName: string, state: string): Promise<number> {
    try {
      let query = this.shopRepository.createQueryBuilder('shop');

      if (state && state.trim() !== '') {
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
          // No additional filtering for super_admin or Admin
        } else {
          query = query
            .innerJoin('shop.owner', 'owner')
            .innerJoin('shop.shipping_address', 'shipping_address')
            .where({
              'owner.permissionName': permissionName,
              'shipping_address.state': state,
            });
        }
      }

      const totalShops = await query
        .select('COUNT(DISTINCT shop.id)', 'totalShops')
        .getRawOne()
        .then(result => result.totalShops || 0);

      return totalShops;
    } catch (error) {
      console.error('Error calculating total shops:', error.message);
      return 0;
    }
  }


  private async calculateTodaysRevenue(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const users = await this.userRepository.find({
        where: { UsrBy: { id: user.id } },
      });

      const userIds = [user.id, ...users.map(u => u.id)];

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      let todayOrders;

      if (state && state.trim() !== '') {
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
          todayOrders = await this.orderRepository
            .createQueryBuilder('order')
            .innerJoin('order.shipping_address', 'shipping_address')
            .where({
              created_at: Between(todayStart, todayEnd),
              state,
            })
            .getMany();
        } else {
          todayOrders = await this.orderRepository
            .createQueryBuilder('order')
            .innerJoin('order.shipping_address', 'shipping_address')
            .where({
              created_at: Between(todayStart, todayEnd),
              customer_id: In(userIds),
              'shipping_address.state': state,
            })
            .getMany();
        }
      } else {
        // No state filter
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
          todayOrders = await this.orderRepository
            .createQueryBuilder('order')
            .innerJoin('order.shipping_address', 'shipping_address')
            .where({
              created_at: Between(todayStart, todayEnd),
            })
            .getMany();
        } else {
          todayOrders = await this.orderRepository
            .createQueryBuilder('order')
            .innerJoin('order.shipping_address', 'shipping_address')
            .where({
              created_at: Between(todayStart, todayEnd),
              customer_id: In(userIds),
            })
            .getMany();
        }
      }

      const todayRevenue = todayOrders.reduce((total, order) => total + order.total, 0);
      return todayRevenue;
    } catch (error) {
      console.error('Error calculating today\'s revenue:', error.message);
      return 0;
    }
  }


  private async calculateTotalOrders(userId: number, permissionName: string, state: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const usrByIdUsers = await this.userRepository.find({
      where: { UsrBy: { id: user.id } },
    });

    const userIds = [user.id, ...usrByIdUsers.map(usr => usr.id)];

    let query = this.orderRepository.createQueryBuilder('order');

    if (state && state.trim() !== '') {
      if (permissionName === 'super_admin' || permissionName === 'Admin') {
        query = query
          .innerJoin('order.shipping_address', 'shipping_address')
          .where('shipping_address.state = :state', { state });
        return query.getCount();
      } else {
        query = query
          .innerJoin('order.shipping_address', 'shipping_address')
          .where('order.customer_id IN (:...userIds) AND shipping_address.state = :state', { userIds, state });
        return query.getCount();
      }
    } else {
      // No state filter
      if (permissionName === 'super_admin' || permissionName === 'Admin') {
        return query.getCount();
      } else {
        query = query
          .innerJoin('order.shipping_address', 'shipping_address')
          .where('order.customer_id IN (:...userIds)', { userIds });
        return query.getCount();
      }
    }
  }

  private async calculateNewCustomers(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let newShops;

      if (state && state.trim() !== '') {
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
          newShops = await this.shopRepository.find({
            where: {
              created_at: MoreThanOrEqual(thirtyDaysAgo),
            },
          });
        } else {
          newShops = await this.shopRepository
            .createQueryBuilder('shop')
            .innerJoin('shop.owner', 'owner')
            .innerJoin('shop.shipping_address', 'shipping_address')
            .where({
              created_at: MoreThanOrEqual(thirtyDaysAgo),
              'owner.id': userId,
              'shipping_address.state': state,
            })
            .getMany();
        }
      } else {
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
          newShops = await this.shopRepository.find({
            where: {
              created_at: MoreThanOrEqual(thirtyDaysAgo),
            },
          });
        } else {
          newShops = await this.shopRepository
            .createQueryBuilder('shop')
            .innerJoin('shop.owner', 'owner')
            .where({
              created_at: MoreThanOrEqual(thirtyDaysAgo),
              'owner.id': userId,
            })
            .getMany();
        }
      }

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

      let query = this.orderRepository.createQueryBuilder('order');

      if (state && state.trim() !== '') {
        if (permissionName !== 'super_admin' && permissionName !== 'Admin') {
          const user = await this.userRepository.findOne({ where: { id: userId } });
          const usrByIdUsers = await this.userRepository.find({
            where: { UsrBy: { id: user.id } },
          });

          const userIds = [user.id, ...usrByIdUsers.map(usr => usr.id)];

          query = query
            .innerJoin('order.shipping_address', 'shipping_address')
            .where('order.customer_id IN (:...userIds) AND shipping_address.state = :state', { userIds, state })
            .andWhere('order.created_at BETWEEN :firstDay AND :lastDay', {
              firstDay: firstDayOfMonth,
              lastDay: lastDayOfMonth,
            });
        } else {
          query = query
            .innerJoin('order.shipping_address', 'shipping_address')
            .where('order.created_at BETWEEN :firstDay AND :lastDay AND shipping_address.state = :state', {
              firstDay: firstDayOfMonth,
              lastDay: lastDayOfMonth,
              state,
            });
        }
      } else {
        // No state filter
        if (permissionName !== 'super_admin' && permissionName !== 'Admin') {
          const user = await this.userRepository.findOne({ where: { id: userId } });
          const usrByIdUsers = await this.userRepository.find({
            where: { UsrBy: { id: user.id } },
          });

          const userIds = [user.id, ...usrByIdUsers.map(usr => usr.id)];

          query = query
            .innerJoin('order.shipping_address', 'shipping_address')
            .where('order.customer_id IN (:...userIds)', { userIds })
            .andWhere('order.created_at BETWEEN :firstDay AND :lastDay', {
              firstDay: firstDayOfMonth,
              lastDay: lastDayOfMonth,
            });
        } else {
          query = query
            .innerJoin('order.shipping_address', 'shipping_address')
            .where('order.created_at BETWEEN :firstDay AND :lastDay', {
              firstDay: firstDayOfMonth,
              lastDay: lastDayOfMonth,
            });
        }
      }

      const orders = await query
        .select('SUM(order.total)', 'total')
        .getRawOne();

      return parseInt(orders.total, 10) || 0;
    } catch (error) {
      console.error(`Error calculating total sales for month ${month}: ${error.message}`);
      return 0;
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
}

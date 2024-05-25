import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { AnalyticsResponseDTO, TotalYearSaleByMonthDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { UserAddress } from 'src/addresses/entities/address.entity';
import { User } from 'src/users/entities/user.entity';
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
      const user = await this.userRepository.findOne({ where: { id: customerId }, relations: ['type'] });

      if (!user) {
        throw new NotFoundException(`User with ID ${customerId} not found`);
      }

      const userPermissions = await this.permissionRepository.findOne({
        where: { permission_name: user.type.permission_name },
      });

      if (!(userPermissions && ['Admin', 'super_admin', 'dealer', 'Vendor'].includes(userPermissions.type_name))) {
        throw new ForbiddenException(`User with ID ${customerId} does not have permission to access analytics`);
      }

      const analyticsResponse: AnalyticsResponseDTO = {
        totalRevenue: await this.calculateTotalRevenue(user.id, state),
        totalRefunds: await this.calculateTotalRefunds(userPermissions.type_name, state),
        totalShops: await this.calculateTotalShops(user.id, userPermissions.type_name, state),
        todaysRevenue: await this.calculateTodaysRevenue(user.id, userPermissions.type_name, state),
        totalOrders: await this.calculateTotalOrders(user.id, userPermissions.type_name, state),
        newCustomers: await this.calculateNewCustomers(user.id, userPermissions.type_name, state),
        totalYearSaleByMonth: await this.calculateTotalYearSaleByMonth(user.id, userPermissions.type_name, state),
      };

      return analyticsResponse;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error; // Propagate specific exceptions
      }
      throw new NotFoundException(`Error fetching analytics: ${error.message}`); // Convert other errors to NotFoundException
    }
  }

  private async calculateTotalRevenue(userId: number, state: string): Promise<number> {
    try {
      const usrByIdUsers = await this.userRepository.find({
        where: { UsrBy: { id: userId } },
      });

      const userIds = [userId, ...usrByIdUsers.map(u => u.id)];

      let queryBuilder = this.orderRepository.createQueryBuilder('order');

      if (state && state.trim() !== '') {
        queryBuilder = queryBuilder
          .innerJoin('order.shipping_address', 'shipping_address')
          .andWhere('order.customer_id IN (:...userIds) AND shipping_address.state = :state', { userIds, state });
      } else {
        queryBuilder = queryBuilder
          .andWhere('order.customer_id IN (:...userIds)', { userIds });
      }

      const orders = await queryBuilder.getMany();
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      return totalRevenue;
    } catch (error) {
      console.error('Error calculating total revenue:', error.message);
      return 0;
    }
  }

  private async calculateTotalRefunds(permissionName: string, state: string): Promise<number> {
    try {
      let query = this.refundRepository.createQueryBuilder('refund');

      if (state && state.trim() !== '') {
        if (permissionName === 'super_admin' || permissionName === 'Admin') {
          // Handle cases where permissionName is super_admin or Admin
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
        .then(result => result?.totalRefunds || 0); // Ensure accessing totalRefunds safely

      return totalRefunds;
    } catch (error) {
      console.error('Error calculating total refunds:', error.message);
      return 0; // Return 0 if there's an error
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


  async getTopUsersWithMaxOrders(userId: number): Promise<any[]> {
    try {
      const orderQueryBuilder = this.orderRepository.createQueryBuilder('order')
        .select(['customer', 'COUNT(order.id) AS orderCount'])
        .leftJoin('order.customer', 'customer')
        .groupBy('customer.UsrBy.id')
        .having('orderCount > 0') // Exclude users with no orders
        .orderBy('orderCount', 'DESC')
        .take(10); // Change this value to get the desired number of top users

      if (userId) {
        const usrByIdUsers = await this.userRepository.find({
          where: { UsrBy: { id: userId } },
        });

        const userIds = [userId, ...usrByIdUsers.map(u => u.id)];

        if (userIds.length > 0) {
          const result = await orderQueryBuilder
            .andWhere('customer.UsrBy.id IN (:...userIds)', { userIds })
            .getRawMany();

          return result.flatMap((m) => ({ userId: m.customer_id, UsrBy: m.customer_usrById, name: m.customer_name, email: m.customer_email, phone: m.customer_contact }));
        }
      }

      return [];
    } catch (error) {
      console.error('Error getting top users with max orders:', error.message);
      return [];
    }
  }

  async getTopDealer(userId?: number): Promise<any[]> {
    try {
      // Step 1: Get all users with dealer role
      let dealerUsersQuery;
      dealerUsersQuery = (await this.userRepository.find({
        where: { UsrBy: { id: Number(userId) } },
        relations: ['dealer'],
      })).filter((dlr) => dlr.dealer !== null).flatMap((usr) => usr.id);

      // Step 2: Get all users by matching UsrBy field to dealers' user ids
      const usrByDealer = (await this.orderRepository.find({
        relations: ['customer', 'customer.UsrBy'],
      }))
        .filter((ordUsr) => dealerUsersQuery.includes(ordUsr.customer.UsrBy.id));

      // Step 3: Count orders for each customer and order them by count
      const ordersByDealers = await this.orderRepository
        .createQueryBuilder('order')
        .select('customer.id', 'customerId')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoin('order.customer', 'customer')
        .where('customer.UsrBy IN (:...dealerUserIds)', { dealerUserIds: dealerUsersQuery })
        .groupBy('customer.id')
        .orderBy('orderCount', 'DESC')
        .getRawMany();

      // Extract customerIds from ordersByDealers
      const customerIds = ordersByDealers.map(order => order.customerId);

      const topDealers = await this.userRepository
        .createQueryBuilder('users')
        .select('users', 'users')
        .where('users.id IN (:...customerIds)', { customerIds })
        .groupBy('users.UsrBy')
        .limit(5)
        .getRawMany();

      return topDealers.map((m) => ({ userId: m.users_id, UsrBy: m.users_usrById, name: m.users_name, email: m.users_email, phone: m.users_contact, dealerId: m.users_dealerId }));
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

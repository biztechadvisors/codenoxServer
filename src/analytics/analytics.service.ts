import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { AnalyticsResponseDTO, TotalYearSaleByMonthDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { User, UserType } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  refundRepository: any;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(StocksSellOrd)
    private readonly stocksSellOrdRepository: Repository<StocksSellOrd>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  async findAll(shop_id: number | null, customerId: number, state: string): Promise<AnalyticsResponseDTO | { message: string }> {
    try {
      // Create a unique cache key
      const cacheKey = `analytics:${shop_id}:${customerId}:${state}`;
      const cachedResult = await this.cacheManager.get<AnalyticsResponseDTO>(cacheKey);

      if (cachedResult) {
        this.logger.log(`Cache hit for key: ${cacheKey}`);
        return cachedResult;
      }

      if (!customerId && !shop_id) {
        return { message: 'Customer ID or Shop ID is required' };
      }

      const [user, shop] = await Promise.all([
        customerId ? this.userRepository.findOne({ where: { id: customerId }, relations: ['permission'] }) : null,
        shop_id ? this.shopRepository.findOne({ where: { id: shop_id }, relations: ['owner', 'owner.permission'] }) : null
      ]);

      if (!user && !shop) {
        return { message: `User with ID ${customerId} and Shop with ID ${shop_id} not found` };
      }

      const userTypePermissionName = user?.permission?.permission_name;
      const shopOwnerTypePermissionName = shop?.owner?.permission?.permission_name;

      if (!userTypePermissionName && !shopOwnerTypePermissionName) {
        return { message: 'Permission type not found for user or shop owner' };
      }

      const permissionName = userTypePermissionName || shopOwnerTypePermissionName;
      const userPermissions = await this.permissionRepository.findOne({ where: { permission_name: permissionName } });

      if (!userPermissions) {
        return { message: `User with ID ${customerId} does not have any permissions` };
      }

      const allowedPermissions = ['Admin', 'Super_Admin', 'Dealer', 'Company'];
      if (!allowedPermissions.includes(userPermissions.type_name)) {
        return { message: `User with ID ${customerId} does not have permission to access analytics` };
      }

      const ownerId = user?.id || shop?.owner_id;

      const analyticsResponse = await Promise.all([
        this.calculateTotalRevenue(ownerId, userPermissions.type_name, state),
        this.calculateTotalRefunds(userPermissions.type_name, state),
        this.calculateTotalShops(ownerId, userPermissions.type_name, state),
        this.calculateTodaysRevenue(ownerId, userPermissions.type_name, state),
        this.calculateTotalOrders(ownerId, userPermissions.type_name, state),
        this.calculateNewCustomers(ownerId, userPermissions.type_name, state),
        this.calculateTotalYearSaleByMonth(ownerId, userPermissions.type_name, state)
      ]).then(([totalRevenue, totalRefunds, totalShops, todaysRevenue, totalOrders, newCustomers, totalYearSaleByMonth]) => ({
        totalRevenue,
        totalRefunds,
        totalShops,
        todaysRevenue,
        totalOrders,
        newCustomers,
        totalYearSaleByMonth
      }));

      // Cache the result for future requests
      await this.cacheManager.set(cacheKey, analyticsResponse, 1800); // Cache for 30 minutes
      this.logger.log(`Data cached with key: ${cacheKey}`);

      return analyticsResponse;

    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { message: `Error fetching analytics: ${error.message}` };
    }
  }


  private async calculateTotalRevenue(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const createdByUsers = await this.userRepository.find({
        where: { createdBy: { id: userId } },
      });

      const userIds = [userId, ...createdByUsers.map(u => u.id)];

      let queryBuilder: SelectQueryBuilder<Order> | SelectQueryBuilder<StocksSellOrd>;
      if (permissionName === UserType.Dealer) {
        queryBuilder = this.stocksSellOrdRepository.createQueryBuilder('order');
      } else {
        queryBuilder = this.orderRepository.createQueryBuilder('order');
      }

      queryBuilder = queryBuilder.innerJoin('order.shipping_address', 'shipping_address');

      if (state?.trim()) {
        queryBuilder = queryBuilder
          .andWhere('shipping_address.state = :state', { state })
          .andWhere('order.customer_id IN (:...userIds)', { userIds });
      } else {
        if (permissionName === UserType.Dealer) {
          queryBuilder = queryBuilder
            .andWhere('order.soldBy IN (:...userIds)', { userIds });
        } else {
          queryBuilder = queryBuilder
            .andWhere('order.customer_id IN (:...userIds)', { userIds });
        }
      }

      const orders = await queryBuilder.getMany();
      const totalRevenue = (orders as any[]).reduce((sum, order) => sum + (order.total || 0), 0);

      return totalRevenue;
    } catch (error) {
      console.error('Error calculating total revenue:', error.message);
      return 0;
    }
  }

  private async calculateTotalRefunds(permissionName: string, state: string): Promise<number> {
    try {
      let query = this.refundRepository.createQueryBuilder('refund');

      if (state?.trim() && !['Company', 'Staff'].includes(permissionName)) {
        query = query.innerJoin('refund.order', 'order').innerJoin('order.shipping_address', 'shipping_address').where('shipping_address.state = :state', { state });
      }

      const result = await query.select('COUNT(DISTINCT refund.id)', 'totalRefunds').getRawOne();
      return result?.totalRefunds || 0;

    } catch (error) {
      console.error('Error calculating total refunds:', error.message);
      return 0;
    }
  }

  private async calculateTotalShops(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      if (!['Company', 'Staff'].includes(permissionName)) return 0;

      const queryBuilder = this.shopRepository.createQueryBuilder('shop')
        .innerJoin('shop.owner', 'owner')
        .innerJoin('shop.address', 'address')
        .andWhere('(owner.createdBy.id = :userId OR shop.owner_id = :userId)', { userId });

      if (state?.trim()) {
        queryBuilder.andWhere('address.state = :state', { state });
      }

      return await queryBuilder.getCount();

    } catch (error) {
      console.error('Error calculating total shops:', error.message);
      return 0;
    }
  }

  private async calculateTodaysRevenue(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const users = await this.userRepository.find({ where: { createdBy: { id: userId } } });
      const userIds = [userId, ...users.map((u) => u.id)];

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

      let queryBuilder = this.orderRepository.createQueryBuilder('order')
        .innerJoin('order.shipping_address', 'shipping_address')
        .where('created_at BETWEEN :todayStart AND :todayEnd', { todayStart, todayEnd });

      if (state?.trim()) {
        if (['Company', 'Staff'].includes(permissionName)) {
          queryBuilder.andWhere('shipping_address.state = :state', { state });
        } else {
          queryBuilder.andWhere('shipping_address.state = :state AND order.customer_id IN (:userIds)', { state, userIds });
        }
      } else if (!['super_admin', 'Admin'].includes(permissionName)) {
        queryBuilder.andWhere('order.customer_id IN (:userIds)', { userIds });
      }

      const todayOrders = await queryBuilder.getMany();
      return todayOrders.reduce((total, order) => total + order.total, 0);

    } catch (error) {
      console.error("Error calculating today's revenue:", error.message);
      return 0;
    }
  }

  private async calculateTotalOrders(userId: number, permissionName: string, state: string): Promise<number> {
    try {
      const createdByUsers = await this.userRepository.find({ where: { createdBy: { id: userId } } });
      const userIds = [userId, ...createdByUsers.map((usr) => usr.id)];

      let query = permissionName === UserType.Dealer
        ? this.stocksSellOrdRepository.createQueryBuilder('order')
        : this.orderRepository.createQueryBuilder('order');

      query = query.innerJoin('order.shipping_address', 'shipping_address');

      if (state?.trim()) {
        query = query.where('shipping_address.state = :state', { state });

        if (!['Company', 'Staff'].includes(permissionName)) {
          query = query.andWhere('order.customer_id IN (:...userIds)', { userIds });
        }
      } else if (!['Company', 'Staff'].includes(permissionName)) {
        query = permissionName === UserType.Dealer
          ? query.where('order.soldBy IN (:...userIds)', { userIds })
          : query.where('order.customer_id IN (:...userIds)', { userIds });
      }

      return await query.getCount();

    } catch (error) {
      console.error(`Error calculating total orders: ${error.message}`);
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

      if (['Company', 'Staff'].includes(permissionName)) {
        if (state?.trim()) {
          query = query.andWhere('shop.shipping_address.state = :state', { state });
        }
      } else {
        query = query.andWhere('shop.owner_id = :userId', { userId });
        if (state?.trim()) {
          query = query.andWhere('shop.shipping_address.state = :state', { state });
        }
      }

      const newShops = await query.getMany();
      return newShops.length;

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

      let query = permissionName === UserType.Dealer
        ? this.stocksSellOrdRepository.createQueryBuilder('order').innerJoin('order.shipping_address', 'shipping_address')
        : this.orderRepository.createQueryBuilder('order').innerJoin('order.shipping_address', 'shipping_address');

      query = query.where('order.created_at BETWEEN :firstDay AND :lastDay', {
        firstDay: firstDayOfMonth,
        lastDay: lastDayOfMonth,
      });

      const createdByUsers = await this.userRepository.find({ where: { createdBy: { id: userId } } });
      const userIds = [userId, ...createdByUsers.map(user => user.id)];

      if (state?.trim()) {
        if (!['Company', 'Staff'].includes(permissionName)) {
          query = query.andWhere('order.customer_id IN (:...userIds) AND shipping_address.state = :state', { userIds, state });
        } else {
          query = query.andWhere('shipping_address.state = :state', { state });
        }
      } else if (!['Company', 'Staff'].includes(permissionName)) {
        if (permissionName.includes(UserType.Dealer)) {
          query = query.andWhere('order.soldBy IN (:...userIds)', { userIds });
        } else {
          query = query.andWhere('order.customer_id IN (:...userIds)', { userIds });
        }
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
      // Create a cache key based on userId
      const cacheKey = `top-users-with-max-orders:${userId}`;
      const cachedResult = await this.cacheManager.get<any[]>(cacheKey);

      if (cachedResult) {
        this.logger.log(`Cache hit for key: ${cacheKey}`);
        return cachedResult;
      }

      const orderQueryBuilder = this.orderRepository.createQueryBuilder('order')
        .select(['customer', 'COUNT(order.id) AS orderCount'])
        .leftJoin('order.customer', 'customer')
        .groupBy('customer.createdBy.id')
        .having('orderCount > 0') // Exclude users with no orders
        .orderBy('orderCount', 'DESC')
        .take(10); // Change this value to get the desired number of top users

      if (userId) {
        const usrByIdUsers = await this.userRepository.find({
          where: { createdBy: { id: userId } },
        });

        const userIds = [userId, ...usrByIdUsers.map(u => u.id)];

        if (userIds.length > 0) {
          const result = await orderQueryBuilder
            .andWhere('customer.createdBy.id IN (:...userIds)', { userIds })
            .getRawMany();

          const formattedResult = result.flatMap((m) => ({
            userId: m.customer_id,
            createdBy: m.customer_usrById,
            name: m.customer_name,
            email: m.customer_email,
            phone: m.customer_contact,
          }));

          // Cache the result for future requests
          await this.cacheManager.set(cacheKey, formattedResult, 1800); // Cache for 30 minutes
          this.logger.log(`Data cached with key: ${cacheKey}`);

          return formattedResult;
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
      // Create a cache key based on userId
      const cacheKey = `top-dealers:${userId}`;
      const cachedResult = await this.cacheManager.get<any[]>(cacheKey);

      if (cachedResult) {
        this.logger.log(`Cache hit for key: ${cacheKey}`);
        return cachedResult;
      }

      // Step 1: Get all users with dealer role
      const dealerUsersQuery = (await this.userRepository.find({
        where: { createdBy: { id: Number(userId) } },
        relations: ['dealer'],
      })).filter((dlr) => dlr.dealer !== null).flatMap((usr) => usr.id);

      // Step 2: Get all users by matching createdBy field to dealers' user ids
      const usrByDealer = (await this.orderRepository.find({
        relations: ['customer', 'customer.createdBy'],
      })).filter((ordUsr) => dealerUsersQuery.includes(ordUsr.customer.createdBy.id));

      // Step 3: Count orders for each customer and order them by count
      const ordersByDealers = await this.orderRepository
        .createQueryBuilder('order')
        .select('customer.id', 'customerId')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoin('order.customer', 'customer')
        .where('customer.createdBy IN (:...dealerUserIds)', { dealerUserIds: dealerUsersQuery })
        .groupBy('customer.id')
        .orderBy('orderCount', 'DESC')
        .getRawMany();

      // Extract customerIds from ordersByDealers
      const customerIds = ordersByDealers.map(order => order.customerId);

      const topDealers = await this.userRepository
        .createQueryBuilder('users')
        .select('users', 'users')
        .where('users.id IN (:...customerIds)', { customerIds })
        .groupBy('users.createdBy')
        .limit(5)
        .getRawMany();

      const formattedResult = topDealers.map((m) => ({
        userId: m.users_id,
        createdBy: m.users_usrById,
        name: m.users_name,
        email: m.users_email,
        phone: m.users_contact,
        dealerId: m.users_dealerId,
      }));

      // Cache the result for future requests
      await this.cacheManager.set(cacheKey, formattedResult, 1800); // Cache for 30 minutes
      this.logger.log(`Data cached with key: ${cacheKey}`);

      return formattedResult;
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

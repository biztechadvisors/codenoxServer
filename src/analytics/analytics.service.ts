import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository, SelectQueryBuilder } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { AnalyticsResponseDTO, TotalYearSaleByMonthDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { User, UserType } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { Refund } from '../refunds/entities/refund.entity';
import { format } from 'date-fns';
import { CreateTotalYearSaleByMonthDto } from './dto/create-analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(StocksSellOrd)
    private readonly stocksSellOrdRepository: Repository<StocksSellOrd>,
    @InjectRepository(TotalYearSaleByMonth)
    private readonly totalYearSaleByMonthRepository: Repository<TotalYearSaleByMonth>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

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
          await this.cacheManager.set(cacheKey, formattedResult, 60); // Cache for 30 minutes
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
      await this.cacheManager.set(cacheKey, formattedResult, 60); // Cache for 30 minutes
      this.logger.log(`Data cached with key: ${cacheKey}`);

      return formattedResult;
    } catch (error) {
      console.error('Error getting top dealers with max orders:', error.message);
      return [];
    }
  }

  // **************** Create And Get Analytics *********************

  async getAnalyticsById(analyticsId: number): Promise<Analytics> {
    const analytics = await this.analyticsRepository.findOne({
      where: { id: analyticsId },
      relations: ['totalYearSaleByMonth'],
    });

    if (!analytics) {
      throw new NotFoundException(`Analytics with ID ${analyticsId} not found`);
    }

    return analytics;
  }

  async updateAnalytics(
    order?: Order,
    refund?: Refund,
    shop?: Shop
  ): Promise<void> {
    try {
      if (!order && !refund && !shop) {
        throw new BadRequestException('At least one of Order, Refund, or Shop must be provided');
      }

      // Determine userId based on the provided entities
      let userId: number | undefined;
      if (order) {
        userId = order.dealer ? order.dealer.id : order.shop[0].owner_id;
      } else if (refund) {
        userId = refund.customer.createdBy ? refund.customer.createdBy.id : refund.shop.owner_id;
      } else if (shop) {
        userId = shop.owner_id ? shop.owner_id : shop.owner.id;
      }

      const shopId = shop?.id || order?.shop_id || refund?.shop.id;

      if (!shopId || !userId) {
        throw new BadRequestException('Shop ID and User ID must be available');
      }

      // Fetch existing analytics or initialize a new one
      let analytics = await this.analyticsRepository.findOne({
        where: { shop_id: shopId, user_id: userId },
        relations: ['totalYearSaleByMonth'],
      });

      if (!analytics) {
        analytics = this.analyticsRepository.create({
          totalRevenue: 0,
          totalOrders: 0,
          totalRefunds: 0,
          totalShops: shop ? 1 : 0,
          todaysRevenue: 0,
          newCustomers: 0,
          shop_id: shopId,
          user_id: userId,
          totalYearSaleByMonth: [],
        });
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      // Ensure values are numbers before updating
      const updateValue = (value: number = 0, delta: number = 0) => {
        if (typeof value !== 'number' || typeof delta !== 'number') {
          throw new TypeError('Both value and delta must be numbers');
        }
        return parseFloat((value + delta).toFixed(2));
      };

      // Ensure all monetary values are parsed as numbers
      analytics.totalRevenue = parseFloat(analytics.totalRevenue.toString());
      analytics.todaysRevenue = parseFloat(analytics.todaysRevenue.toString());
      analytics.totalRefunds = parseFloat(analytics.totalRefunds.toString());

      // Update analytics based on the order
      if (order) {
        analytics.totalOrders += 1;
        analytics.totalRevenue = updateValue(analytics.totalRevenue, order.total);

        if (today === format(order.created_at, 'yyyy-MM-dd')) {
          analytics.todaysRevenue = updateValue(analytics.todaysRevenue, order.total);
        }
      }

      // Update analytics based on the refund
      if (refund) {
        analytics.totalRefunds = updateValue(analytics.totalRefunds, refund.amount);
        analytics.totalRevenue = updateValue(analytics.totalRevenue, -refund.amount);

        if (today === format(refund.created_at, 'yyyy-MM-dd')) {
          analytics.todaysRevenue = updateValue(analytics.todaysRevenue, -refund.amount);
        }
      }

      // Update or create monthly sales record for the shop
      const currentMonth = format(new Date(), 'MMMM');
      let monthlySale = analytics.totalYearSaleByMonth.find(sale => sale.month === currentMonth);

      const currentTotal = (order?.total || 0) - (refund?.amount || 0);

      if (!monthlySale) {
        monthlySale = this.totalYearSaleByMonthRepository.create({
          month: currentMonth,
          total: currentTotal,
        });
        analytics.totalYearSaleByMonth.push(monthlySale);
      } else {
        monthlySale.total = parseFloat(monthlySale.total.toString());
        monthlySale.total = updateValue(monthlySale.total, currentTotal);
      }

      await this.totalYearSaleByMonthRepository.save(monthlySale);
      await this.analyticsRepository.save(analytics);
    } catch (error) {
      this.logger.error('Error updating analytics:', error.stack || error);
      throw new InternalServerErrorException('Failed to update analytics');
    }
  }

  async createAnalyticsWithTotalYearSale(
    analyticsData: Partial<Analytics>,
    saleData: CreateTotalYearSaleByMonthDto[]
  ): Promise<Analytics> {
    try {
      const saleEntities = saleData.map(dto => this.totalYearSaleByMonthRepository.create(dto));

      const totalYearSaleByMonthRecords = await this.totalYearSaleByMonthRepository.save(saleEntities);
      const newAnalytics = this.analyticsRepository.create({
        ...analyticsData,
        totalYearSaleByMonth: totalYearSaleByMonthRecords,
      });

      return await this.analyticsRepository.save(newAnalytics);
    } catch (error) {
      this.logger.error('Error creating analytics with total year sale by month:', error.message);
      throw new InternalServerErrorException('Failed to create analytics with total year sale by month');
    }
  }

  async findAll(
    shop_id: number | null,
    customerId: number | null,
    state: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsResponseDTO | { message: string }> {
    try {
      // If neither customerId nor shop_id is provided, return an error
      if (!customerId && !shop_id) {
        return { message: 'Customer ID or Shop ID is required' };
      }

      let user, shop;
      let isOwnerMatch = false;

      // Step 1: If shop_id is provided, fetch the shop
      if (shop_id) {
        shop = await this.shopRepository.findOne({
          where: { id: shop_id },
          relations: ['owner', 'owner.permission']
        });

        if (!shop) {
          return { message: `Shop with ID ${shop_id} not found` };
        }

        // If customerId is not provided, use the shop owner ID as customerId
        if (!customerId) {
          customerId = shop.owner_id;
          isOwnerMatch = true; // Since customerId is the shop owner, we consider it a match
        } else if (customerId === shop.owner_id) {
          // If customerId is provided and matches the shop owner, consider it a match
          isOwnerMatch = true;
        }
      }

      // Step 2: If customerId does not match shop owner, fetch the user based on customerId
      if (!isOwnerMatch && customerId) {
        user = await this.userRepository.findOne({
          where: { id: customerId },
          relations: ['permission']
        });

        if (!user) {
          return { message: `User with ID ${customerId} not found` };
        }
      }

      // Step 3: Get the permission of the user or shop owner
      const permissionName = user?.permission?.permission_name || shop?.owner?.permission?.permission_name;
      const userPermissions = await this.permissionRepository.findOne({ where: { permission_name: permissionName } });

      if (!userPermissions) {
        return { message: `User with ID ${customerId} does not have any permissions` };
      }

      const allowedPermissions = ['Admin', 'Super_Admin', 'Dealer', 'Company'];
      if (!allowedPermissions.includes(userPermissions.type_name)) {
        return { message: `User with ID ${customerId} does not have permission to access analytics` };
      }

      // Step 4: Build user_ids array based on permissions and ownership
      let userIdArray: number[] = [];
      if (isOwnerMatch) {
        // If customerId matches the shop owner, get data for the shop's owner and related users
        if (userPermissions.type_name === 'Dealer') {
          userIdArray.push(customerId); // Dealer logic, just use the customerId
        } else if (userPermissions.type_name === 'Company') {
          const userIds = await this.userRepository.find({
            where: { createdBy: { id: shop?.owner_id } },
            select: ['id']
          });
          userIdArray = userIds.map(user => user.id);
          if (shop?.owner_id && !userIdArray.includes(shop.owner_id)) {
            userIdArray.push(shop.owner_id); // Add owner if not already included
          }
        } else {
          userIdArray.push(shop?.owner_id);
        }
      } else {
        // If customerId does not match the shop owner, only get analytics for the individual customer
        userIdArray.push(customerId);
      }

      if (userIdArray.length === 0) {
        return { message: `No users found matching the criteria for shop ID ${shop_id} and customer ID ${customerId}` };
      }

      // Step 5: Build whereClause
      let whereClause: any = {
        user_id: In(userIdArray) // Match analytics based on user_ids array
      };

      if (shop_id && isOwnerMatch) {
        whereClause.shop_id = shop_id;
      }

      if (state) {
        whereClause.state = state;
      }

      if (startDate && endDate) {
        whereClause.created_at = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Step 6: Retrieve all analytics matching the criteria
      const analyticsResponse: Analytics[] = await this.analyticsRepository.find({
        where: whereClause,
        relations: ['totalYearSaleByMonth']
      });

      if (analyticsResponse.length === 0) {
        return { message: `No analytics found for shop ID ${shop_id} and customer ID ${customerId}` };
      }

      // Step 7: Aggregate the analytics data
      const aggregatedResponse: AnalyticsResponseDTO = {
        totalRevenue: 0,
        totalOrders: 0,
        totalRefunds: 0,
        totalShops: 0,
        todaysRevenue: 0,
        newCustomers: 0,
        totalYearSaleByMonth: this.initializeMonthlySales()
      };

      // Aggregate all analytics records
      for (const analytics of analyticsResponse) {
        aggregatedResponse.totalRevenue += parseFloat(analytics.totalRevenue?.toString() || "0");
        aggregatedResponse.totalOrders += analytics.totalOrders ?? 0;
        aggregatedResponse.totalRefunds += parseFloat(analytics.totalRefunds?.toString() || "0");
        aggregatedResponse.totalShops += analytics.totalShops ?? 0;
        aggregatedResponse.todaysRevenue += parseFloat(analytics.todaysRevenue?.toString() || "0");
        aggregatedResponse.newCustomers += analytics.newCustomers ?? 0;

        // Accumulate month-wise sales
        analytics.totalYearSaleByMonth?.forEach((monthSale) => {
          const monthIndex = this.getMonthIndex(monthSale.month);
          aggregatedResponse.totalYearSaleByMonth[monthIndex].total += parseFloat(monthSale.total?.toString() || "0");
        });
      }

      return aggregatedResponse;
    } catch (error) {
      this.logger.error('Error fetching analytics:', error.message);
      return { message: `Error fetching analytics: ${error.message}` };
    }
  }

  // Helper method to initialize the months with 0 values
  private initializeMonthlySales() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.map(month => ({ total: 0, month }));
  }

  // Helper method to get the month index (0-based)
  private getMonthIndex(month: string): number {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(month);
  }

}

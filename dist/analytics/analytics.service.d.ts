import { Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { AnalyticsResponseDTO } from './dto/analytics.dto';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Cache } from 'cache-manager';
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity';
import { Refund } from '../refunds/entities/refund.entity';
export declare class AnalyticsService {
    private readonly orderRepository;
    private readonly shopRepository;
    private readonly userRepository;
    private readonly analyticsRepository;
    private readonly refundRepository;
    private readonly permissionRepository;
    private readonly stocksSellOrdRepository;
    private readonly totalYearSaleByMonthRepository;
    private readonly cacheManager;
    private readonly logger;
    constructor(orderRepository: Repository<Order>, shopRepository: Repository<Shop>, userRepository: Repository<User>, analyticsRepository: Repository<Analytics>, refundRepository: Repository<Refund>, permissionRepository: Repository<Permission>, stocksSellOrdRepository: Repository<StocksSellOrd>, totalYearSaleByMonthRepository: Repository<TotalYearSaleByMonth>, cacheManager: Cache);
    findAll(shop_id: number | null, customerId: number, state: string): Promise<AnalyticsResponseDTO | {
        message: string;
    }>;
    private calculateTotalRevenue;
    private calculateTotalRefunds;
    private calculateTotalShops;
    private calculateTodaysRevenue;
    private calculateTotalOrders;
    private calculateNewCustomers;
    private calculateTotalYearSaleByMonth;
    private calculateTotalSalesForMonth;
    getTopUsersWithMaxOrders(userId: number): Promise<any[]>;
    getTopDealer(userId?: number): Promise<any[]>;
}

import { CoreEntity } from 'src/common/entities/core.entity';
export declare class TotalYearSaleByMonth extends CoreEntity {
    id: number;
    total: number;
    month: string;
    analytics: Analytics[];
}
export declare class Analytics extends CoreEntity {
    id: number;
    totalRevenue?: number;
    totalOrders: number;
    user_id: number;
    shop_id: number;
    todaysRevenue?: number;
    totalRefunds?: number;
    totalShops: number;
    totalDealers: number;
    newCustomers: number;
    totalYearSaleByMonth?: TotalYearSaleByMonth[];
}

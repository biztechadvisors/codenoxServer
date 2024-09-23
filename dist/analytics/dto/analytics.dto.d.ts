export declare class TotalYearSaleByMonthDTO {
    total: number;
    month: string;
}
export declare class AnalyticsResponseDTO {
    totalRevenue: number;
    totalRefunds: number;
    totalShops: number;
    todaysRevenue: number;
    totalOrders: number;
    newCustomers: number;
    totalYearSaleByMonth: TotalYearSaleByMonthDTO[];
}
export declare class TopUsersQueryDto {
    userId: number;
}
export declare class GetAnalyticsDto {
    shop_id?: number;
    customerId?: number;
    state: string;
    startDate?: string;
    endDate?: string;
}

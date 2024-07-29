// total-year-sale-by-month.dto.ts

export class TotalYearSaleByMonthDTO {
    total: number;
    month: string;
}

// analytics.dto.ts

export class AnalyticsResponseDTO {
    totalRevenue: number;
    totalRefunds: number;
    totalShops: number;
    todaysRevenue: number;
    totalOrders: number;
    newCustomers: number;
    totalYearSaleByMonth: TotalYearSaleByMonthDTO[];
}

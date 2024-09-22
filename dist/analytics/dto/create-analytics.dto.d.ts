import { Analytics } from '../entities/analytics.entity';
export declare class CreateTotalYearSaleByMonthDto {
    total: number;
    month: string;
}
export declare class CreateAnalyticsDto {
    analyticsData: Partial<Analytics>;
    saleData: CreateTotalYearSaleByMonthDto[];
}

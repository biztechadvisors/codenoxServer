// total-year-sale-by-month.dto.ts

import { IsInt, IsOptional, IsString } from "class-validator";

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


export class TopUsersQueryDto {
    userId: number;
}

export class GetAnalyticsDto {
    @IsOptional()
    @IsInt()
    shop_id?: number;

    @IsOptional()
    @IsInt()
    customerId?: number;

    @IsOptional()
    @IsString()
    state: string;

    @IsOptional()
    @IsString()
    startDate?: string;

    @IsOptional()
    @IsString()
    endDate?: string;
}

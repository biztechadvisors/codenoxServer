import { IsOptional, IsDecimal, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Analytics } from '../entities/analytics.entity';

// DTOs
export class CreateTotalYearSaleByMonthDto {
    total: number;
    month: string;
}

export class CreateAnalyticsDto {
    analyticsData: Partial<Analytics>;
    saleData: CreateTotalYearSaleByMonthDto[];
}
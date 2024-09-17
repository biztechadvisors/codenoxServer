import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { RefundStatus } from '../entities/refund.entity';

export class CreateRefundDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsOptional()
    @IsEnum(RefundStatus)
    status?: RefundStatus;

    @IsOptional()
    @IsNumber()
    shopId?: number;

    @IsOptional()
    @IsNumber()
    orderId?: number;

    @IsOptional()
    @IsNumber()
    customerId?: number;
}

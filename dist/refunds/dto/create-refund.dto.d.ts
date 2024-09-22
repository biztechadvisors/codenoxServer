import { RefundStatus } from '../entities/refund.entity';
export declare class CreateRefundDto {
    amount: number;
    status?: RefundStatus;
    shopId?: number;
    orderId?: number;
    customerId?: number;
}

import { Withdraw } from '../entities/withdraw.entity';
declare const CreateWithdrawDto_base: import("@nestjs/common").Type<Pick<Withdraw, "shop_id" | "amount" | "details" | "payment_method" | "note">>;
export declare class CreateWithdrawDto extends CreateWithdrawDto_base {
}
export {};

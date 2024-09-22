import { Withdraw } from '../entities/withdraw.entity';
declare const CreateWithdrawDto_base: import("@nestjs/common").Type<Pick<Withdraw, "details" | "shop_id" | "amount" | "payment_method" | "note">>;
export declare class CreateWithdrawDto extends CreateWithdrawDto_base {
}
export {};

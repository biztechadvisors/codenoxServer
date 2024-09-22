import { Dealer } from 'src/users/entities/dealer.entity';
import { PaymentInfo, Shop } from './shop.entity';
export declare class Balance {
    id: number;
    admin_commission_rate: number;
    shop: Shop;
    dealer: Dealer;
    total_earnings: number;
    withdrawn_amount: number;
    current_balance: number;
    payment_info?: PaymentInfo;
}

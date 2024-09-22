import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Profile } from './profile.entity';
import { Dealer } from './dealer.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { InventoryStocks, Stocks } from 'src/stocks/entities/stocks.entity';
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity';
import { Notification } from 'src/notifications/entities/notifications.entity';
import { Add } from '@db/src/address/entities/address.entity';
export declare enum UserType {
    Super_Admin = "Super_Admin",
    Admin = "Admin",
    Dealer = "Dealer",
    Vendor = "Vendor",
    Company = "Company",
    Customer = "Customer",
    Owner = "Owner",
    Staff = "Staff"
}
export declare class User extends CoreEntity {
    id: number;
    name: string;
    email: string;
    password?: string;
    otp: number;
    isVerified: boolean;
    shop_id?: number;
    profile?: Profile;
    dealer?: Dealer;
    createdBy?: User;
    createdUsers?: User[];
    owned_shops?: Shop[];
    notifications: Notification[];
    managed_shop?: Shop;
    inventoryStocks?: InventoryStocks[];
    stocks?: Stocks[];
    is_active?: boolean;
    address?: Add[];
    orders: Order[];
    stockOrd: StocksSellOrd[];
    stocksSellOrd: StocksSellOrd[];
    permission: Permission;
    walletPoints: number;
    contact: string;
    email_verified_at: Date;
}

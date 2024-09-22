import { UserAdd } from 'src/address/entities/address.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Balance } from './balance.entity';
import { ShopSettings } from './shopSettings.entity';
import { Category, SubCategory } from 'src/categories/entities/category.entity';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Region } from '@db/src/region/entities/region.entity';
import { Event } from '@db/src/events/entities/event.entity';
export declare class Shop extends CoreEntity {
    id: number;
    owner_id: number;
    owner: User;
    staffs?: User[];
    is_active: boolean;
    orders_count: number;
    products_count: number;
    balance?: Balance;
    products?: Product[];
    name: string;
    slug: string;
    description?: string;
    cover_image?: Attachment[];
    logo?: Attachment;
    address?: UserAdd;
    settings?: ShopSettings;
    gst_number?: string;
    categories: Category[];
    subCategories: SubCategory[];
    orders: Order[];
    permission?: Permission;
    additionalPermissions: Permission[];
    dealerCount: number;
    events: Event[];
    regions: Region[];
}
export declare class PaymentInfo {
    id: number;
    account: string;
    name: string;
    email: string;
    bank: string;
}

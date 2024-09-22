import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { Order } from '../entities/order.entity';
export declare class OrderPaginator extends Paginator<Order> {
    data: any[];
}
export declare class GetOrdersDto extends PaginationArgs {
    tracking_number?: string;
    orderBy?: string;
    sortedBy?: string;
    customer_id?: number;
    shop_id?: string;
    shopSlug?: string;
    soldByUserAddress?: string;
    search?: string;
    type?: any;
    startDate?: string;
    endDate?: string;
}

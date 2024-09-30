import { StocksService } from './stocks.service';
import { GetOrdersDto, OrderPaginator } from 'src/orders/dto/get-orders.dto';
import { Stocks } from './entities/stocks.entity';
import { UpdateOrderStatusDto } from 'src/orders/dto/create-order-status.dto';
import { CacheService } from '../helpers/cacheService';
export declare class StocksController {
    private readonly stocksService;
    private readonly cacheService;
    constructor(stocksService: StocksService, cacheService: CacheService);
    createStock(createStocksDto: any): Promise<Stocks[]>;
    getAllUserStocks(id: number): Promise<unknown>;
    getStockByUserAndOrder(userId: string, orderId: string): Promise<Stocks[]>;
    getDealerInventoryStocks(userId: number): Promise<any>;
    updateStocksByAdmin(user_id: string, updateStkQuantityDto: any): Promise<{
        message: string;
        error?: undefined;
    } | {
        error: any;
        message?: undefined;
    }>;
    updateInventoryStocksByDealer(user_id: string, updateStkQuantityDto: any): Promise<{
        message: string;
        error?: undefined;
    } | {
        error: any;
        message?: undefined;
    }>;
    afterOrder(createOrderDto: any): Promise<any>;
    orderFromStocks(createOrderDto: any): Promise<any>;
    getOrders(query: GetOrdersDto): Promise<OrderPaginator>;
    getOrderById(id: string): Promise<any>;
    updateOrderStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<import("./entities/stocksOrd.entity").StocksSellOrd>;
    updatePaymentStatus(id: number, updatePaymentStatusDto: any): Promise<import("./entities/stocksOrd.entity").StocksSellOrd>;
}

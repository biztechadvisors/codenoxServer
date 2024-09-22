import { CreateOrderStatusDto, UpdateOrderStatusDto } from './dto/create-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderFilesDto, OrderFilesPaginator } from './dto/get-downloads.dto';
import { GetOrderStatusesDto } from './dto/get-order-statuses.dto';
import { GetOrdersDto, OrderPaginator } from './dto/get-orders.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CheckoutVerificationDto } from './dto/verify-checkout.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { ShiprocketService } from './shiprocket.service';
export declare class OrdersController {
    private readonly ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<Order | {
        statusCode: number;
        message: string;
    }>;
    getOrders(query: GetOrdersDto): Promise<OrderPaginator>;
    getOrderById(id: number): Promise<any>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: number): Promise<void>;
    verifyCheckout(body: CheckoutVerificationDto): Promise<import("./dto/verify-checkout.dto").VerifiedCheckoutData>;
    submitPayment(orderPaymentDto: OrderPaymentDto): Promise<void>;
}
export declare class OrderStatusController {
    private readonly ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    create(createOrderStatusDto: CreateOrderStatusDto): Promise<import("./entities/order-status.entity").OrderStatus>;
    findAll(query: GetOrderStatusesDto): Promise<import("./dto/get-order-statuses.dto").OrderStatusPaginator>;
    findOne(param: string, language: string): Promise<import("./entities/order-status.entity").OrderStatus>;
    update(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<import("./entities/order-status.entity").OrderStatus>;
    remove(id: number): Promise<void>;
}
export declare class OrderFilesController {
    private ordersService;
    constructor(ordersService: OrdersService);
    getOrderFileItems(query: GetOrderFilesDto): Promise<OrderFilesPaginator>;
    getDigitalFileDownloadUrl(digitalFileId: number): Promise<string>;
}
export declare class OrderExportController {
    private ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    orderExport(shop_id: string): Promise<any[]>;
}
export declare class DownloadInvoiceController {
    private ordersService;
    private readonly logger;
    constructor(ordersService: OrdersService);
    downloadInvoiceUrl(input: {
        order_id: string;
    }): Promise<void>;
}
export declare class ShiprocketController {
    private readonly shiprocketService;
    private readonly logger;
    constructor(shiprocketService: ShiprocketService);
    deliveryCharge(requestBody: any): Promise<{
        partner: string;
        shippingCost: any;
        courierDetails: any;
    }>;
    deliveryChargeT(requestBody: any): Promise<any>;
}

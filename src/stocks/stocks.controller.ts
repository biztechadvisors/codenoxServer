/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Query,
    ParseIntPipe,
    NotFoundException,
    Patch,
    BadRequestException
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { GetOrdersDto, OrderPaginator } from 'src/orders/dto/get-orders.dto';
import { Stocks } from './entities/stocks.entity';
import { UpdateOrderStatusDto } from 'src/orders/dto/create-order-status.dto';

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) { }

    // Create a new stock
    @Post()
    async createStock(@Body() createStocksDto: any) {
        return this.stocksService.create(createStocksDto);
    }

    // Get all stocks of a particular user
    @Get('user/:id')
    async getAllUserStocks(@Param('id') id: string) {
        return this.stocksService.getAllStocks(parseInt(id));
    }

    // Get a particular stock by user and order id
    @Get('user/:user_id/order/:order_id')
    async getStockByUserAndOrder(
        @Param('user_id') userId: string,
        @Param('order_id') orderId: string
    ): Promise<Stocks[]> {
        return await this.stocksService.getAll(parseInt(userId), parseInt(orderId));
    }

    // Get dealer inventory stocks
    @Get('inventory/:userId')
    async getDealerInventoryStocks(@Param('userId', ParseIntPipe) userId: number) {
        try {
            const stocks = await this.stocksService.getDealerInventoryStocks(userId);
            return stocks;
        } catch (error) {
            throw new NotFoundException(`Error fetching inventory stocks for user ID ${userId}: ${error.message}`);
        }
    }

    // Update stocks by admin
    @Put('update/admin/:user_id')
    async updateStocksByAdmin(@Param('user_id') user_id: string, @Body() updateStkQuantityDto: any) {
        try {
            await this.stocksService.updateStocksbyAdmin(+user_id, updateStkQuantityDto);
            return { message: 'Quantity updated successfully' };
        } catch (err) {
            return { error: err.message || 'Internal Server Error' };
        }
    }

    // Update inventory stocks by dealer
    @Put('update/inventory/:user_id')
    async updateInventoryStocksByDealer(@Param('user_id') user_id: string, @Body() updateStkQuantityDto: any) {
        try {
            await this.stocksService.updateInventoryStocksByDealer(+user_id, updateStkQuantityDto);
            return { message: 'Quantity updated successfully' };
        } catch (err) {
            return { error: err.message || 'Internal Server Error' };
        }
    }

    // Process after order creation
    @Put('after-order')
    async afterOrder(@Body() createOrderDto: any) {
        return this.stocksService.afterORD(createOrderDto);
    }

    // Create order from stocks
    @Post('order')
    async orderFromStocks(@Body() createOrderDto: any) {
        await this.stocksService.OrdfromStocks(createOrderDto)
        return await this.stocksService.afterORD(createOrderDto);
    }

    // Get orders
    @Get('orders')
    async getOrders(@Query() query: GetOrdersDto): Promise<OrderPaginator> {
        return this.stocksService.getOrders(query);
    }

    // Get order by ID
    @Get('order/:id')
    getOrderById(@Param('id') id: string) {
        const parsedId = Number(id);
        if (isNaN(parsedId)) {
            throw new BadRequestException('Invalid ID');
        }
        return this.stocksService.getOrderById(parsedId);
    }

    @Patch(':id/status')
    updateOrderStatus(
        @Param('id') id: number,
        @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    ) {
        return this.stocksService.updateOrderStatus(id, updateOrderStatusDto);
    }

    @Patch(':id/payment-status')
    updatePaymentStatus(
        @Param('id') id: number,
        @Body() updatePaymentStatusDto: any,
    ) {
        return this.stocksService.updatePaymentStatus(id, updatePaymentStatusDto);
    }
}

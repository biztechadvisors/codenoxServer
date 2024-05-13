/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Query,
    ParseIntPipe
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { GetOrdersDto, OrderPaginator } from 'src/orders/dto/get-orders.dto';
import { Stocks } from './entities/stocks.entity';

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) { }

    @Post()
    async createStock(@Body() createStocksDto: any) {
        return this.stocksService.create(createStocksDto);
    }

    @Get('all/:id')
    async getAllStocks(@Param('id') id: string) {
        return this.stocksService.getAllStocks(parseInt(id));
    }

    @Get(':user_id/:order_id')
    async getAllStocksByUserAndOrder(
        @Param('user_id') userId: string,
        @Param('order_id') orderId: string
    ): Promise<Stocks[]> {
        return await this.stocksService.getAll(parseInt(userId), parseInt(orderId));
    }

    @Put('updateStocks/:user_id')
    async updateStocks(@Param('user_id') user_id: string, @Body() updateStkQuantityDto: any) {
        try {
            await this.stocksService.updateStocksbyAdmin(+user_id, updateStkQuantityDto);
            return { message: 'Quantity updated successfully' };
        } catch (err) {
            return { error: err.message || 'Internal Server Error' };
        }
    }

    @Put('updateInventoryStocks/:user_id')
    async updateInventoryStocks(@Param('user_id') user_id: string, @Body() updateStkQuantityDto: any) {
        try {
            await this.stocksService.updateInventoryStocksByDealer(+user_id, updateStkQuantityDto);
            return { message: 'Quantity updated successfully' };
        } catch (err) {
            return { error: err.message || 'Internal Server Error' };
        }
    }

    // @Put()
    // async afterORD(@Body() createOrderDto: CreateOrderDto) {
    //     return this.stocksService.afterORD(createOrderDto);
    // }

    // @Post('ord')
    // async OrdfromStocks(@Body() createOrderDto: CreateOrderDto) {
    //     await this.stocksService.OrdfromStocks(createOrderDto)
    //     return await this.stocksService.afterORD(createOrderDto);
    // }

    @Get()
    async getOrders(@Query() query: GetOrdersDto): Promise<OrderPaginator> {
        return this.stocksService.getOrders(query);
    }

    @Get('ord/:id')
    getOrderById(@Param('id') id: number) {
        return this.stocksService.getOrderById(Number(id));
    }


}




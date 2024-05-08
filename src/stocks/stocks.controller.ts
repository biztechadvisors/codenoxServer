/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Query
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStocksDto, GetStocksDto, UpdateStkQuantityDto } from './dto/create-stock.dto';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';
import { GetOrdersDto, OrderPaginator } from 'src/orders/dto/get-orders.dto';

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) { }

    // @Post()
    // async create(@Body() createStocksDto: CreateStocksDto) {
    //     return this.stocksService.create(createStocksDto);
    // }


    @Get('all/:id')
    async getAllStocks(@Param('id') id: number) {
        return this.stocksService.getAllStocks(id);
    }

    @Get(':id')
    async getStocks(@Param('id') id: number) {
        return this.stocksService.getAll(id);
    }

    @Put(':user_id')
    async updateQuantity(@Param('user_id') user_id: string, @Body() updateStkQuantityDto: UpdateStkQuantityDto) {
        try {
            await this.stocksService.update(+user_id, updateStkQuantityDto);
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




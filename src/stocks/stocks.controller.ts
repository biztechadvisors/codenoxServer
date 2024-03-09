/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStocksDto, GetStocksDto, UpdateStkQuantityDto } from './dto/create-stock.dto';
import { CreateOrderDto } from 'src/orders/dto/create-order.dto';

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) { }

    @Post()
    async create(@Body() createStocksDto: CreateStocksDto) {
        console.log("create-stock")
        return this.stocksService.create(createStocksDto);
    }


    @Get(':id')
    async getStocks(@Param('id') id: number) {
        console.log(id);
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


    @Put()
    async afterORD(@Body() createOrderDto: CreateOrderDto) {
        console.log("create-afterORD")
        return this.stocksService.afterORD(createOrderDto);
    }

    @Post('Ord')
    async OrdfromStocks(@Body() createOrderDto: CreateOrderDto) {
        await this.stocksService.OrdfromStocks(createOrderDto)
        return await this.stocksService.afterORD(createOrderDto);
    }
}




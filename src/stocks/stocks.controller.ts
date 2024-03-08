/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStocksDto, GetStocksDto } from './dto/create-stock.dto';
import { error } from 'console';

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) { }

    @Post()
    async create(@Body() createStocksDto: CreateStocksDto) {
        return this.stocksService.create(createStocksDto);
    }


    @Get(':id')
    async getStocks(@Param('id') id: number) {
        console.log(id);
        return this.stocksService.getAll(id);
    }


    // @Get(':id')
    // async getStock(
    //     @Query('user_id', ParseIntPipe) user_id: number,
    //     @Query('stock_id', ParseIntPipe) stock_id: number,
    // ) {
    //     return this.stocksService.getOne(user_id, stock_id);
    // }


    @Put()
    async afterORD(@Body() GetStocksDto: GetStocksDto) {
        return this.stocksService.afterORD(GetStocksDto);
    }
}




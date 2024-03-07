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

@Controller('stocks')
export class StocksController {
    constructor(private readonly stocksService: StocksService) { }

    @Post()
    async create(@Body() createStocksDto: CreateStocksDto) {
        const { user_id } = createStocksDto;
        console.log("stock********", createStocksDto)
        return this.stocksService.create(Number(user_id), createStocksDto);
    }


    @Get(':id')
    async getStocks(@Param('id') id: number) {
        return this.stocksService.getAll(id);
    }

    // @Get(':id')
    // async getStock(
    //     @Query('user_id', ParseIntPipe) user_id: number,
    //     @Query('stock_id', ParseIntPipe) stock_id: number,
    // ) {
    //     return this.stocksService.getOne(user_id, stock_id);
    // }

    @Put(':id')
    async removeStock(@Param('id') id: number, quantity: number, product: number): Promise<void> {
        await this.stocksService.afterORD(id, quantity, product);
    }
}

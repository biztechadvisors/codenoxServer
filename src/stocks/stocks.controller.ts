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
        return this.stocksService.create(createStocksDto);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() createStocksDto: CreateStocksDto) {
        return this.stocksService.update(id, createStocksDto);
    }

    @Get()
    async getStocks() {
        return this.stocksService.getAll();
    }

    @Get(':id')
    async getStock(@Param('id', ParseIntPipe) id: number) {
        return this.stocksService.getStocksById(id);
    }

    @Delete(':id')
    async removeStock(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.stocksService.remove(id);
    }
}

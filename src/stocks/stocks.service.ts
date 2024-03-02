import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Stocks } from './entities/stocks.entity';
import { CreateStocksDto } from './dto/create-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StocksService {
    constructor(
        @InjectRepository(Stocks)
        private readonly stocksRepository: Repository<Stocks>,
    ) { }

    async create(createStocksDto: CreateStocksDto): Promise<Stocks> {
        try {
            const stock = this.stocksRepository.create(createStocksDto);
            return await this.stocksRepository.save(stock);
        } catch (error) {
            throw new NotFoundException(`Error creating stock: ${error.message}`);
        }
    }

    async update(id: number, createStocksDto: CreateStocksDto): Promise<Stocks> {
        try {
            const stock = await this.stocksRepository.findOne({ where: { id }, relations: ['product'] });
            if (!stock) {
                throw new NotFoundException(`Stock with ID ${id} not found`);
            }

            // Update properties from the DTO
            stock.quantity = createStocksDto.quantity;
            stock.inStock = createStocksDto.inStock;
            stock.margine = createStocksDto.margine;
            stock.product = createStocksDto.product;

            return await this.stocksRepository.save(stock);
        } catch (error) {
            throw new NotFoundException(`Error updating stock: ${error.message}`);
        }
    }

    async getAll(): Promise<Stocks[]> {
        try {
            return await this.stocksRepository.find({ relations: ['product'] });
        } catch (error) {
            throw new NotFoundException(`Error fetching stocks: ${error.message}`);
        }
    }

    async getStocksById(id: number): Promise<Stocks | null> {
        try {
            return await this.stocksRepository.findOne({ where: { id }, relations: ['product'] });
        } catch (error) {
            throw new NotFoundException(`Error fetching stock by ID: ${error.message}`);
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const stock = await this.stocksRepository.findOne({ where: { id: id } });

            if (!stock) {
                throw new NotFoundException(`Stock with ID ${id} not found`);
            }

            await this.stocksRepository.remove(stock);
        } catch (error) {
            throw new NotFoundException(`Error removing stock: ${error.message}`);
        }
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Stocks } from './entities/stocks.entity';
import { CreateStocksDto } from './dto/create-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Dealer } from 'src/users/entities/dealer.entity';

@Injectable()
export class StocksService {
    constructor(
        @InjectRepository(Stocks)
        private readonly stocksRepository: Repository<Stocks>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Dealer)
        private readonly dealerRepository: Repository<Dealer>,

    ) { }

    async create(id: number, createStocksDto: CreateStocksDto): Promise<Stocks> {
        try {
            const stock = await this.stocksRepository.findOne({ where: { id }, relations: ['product'] });
            if (!stock) {
                // Create properties from the DTO
                const stock = this.stocksRepository.create(createStocksDto);

                return await this.stocksRepository.save(stock);
            } else {
                // Update properties from the DTO
                stock.quantity = stock.quantity + createStocksDto.quantity;
                stock.inStock = createStocksDto.inStock;
                stock.product = createStocksDto.product;

                return await this.stocksRepository.save(stock);
            }
        } catch (error) {
            throw new NotFoundException(`Error updating stock: ${error.message}`);
        }
    }

    async getAll(user_id: number): Promise<Stocks[]> {
        try {
            return await this.stocksRepository.find({ where: { user: { id: user_id } }, relations: ['product'] });
        } catch (error) {
            throw new NotFoundException(`Error fetching stocks: ${error.message}`);
        }
    }

    // async getOne(user_id: number, stock_id: number): Promise<Stocks | null> {
    //     try {
    //         return await this.stocksRepository.findOne({
    //             where: {
    //                 user: { id: user_id },
    //                 id: stock_id
    //             },
    //             relations: ['product'],
    //         });
    //     } catch (error) {
    //         throw new NotFoundException(`Error fetching stock by ID: ${error.message}`);
    //     }
    // }



    async afterORD(id: number, quantity: number, product: number): Promise<void> {
        try {
            const stock = await this.stocksRepository.findOne({ where: { id: id, product: { id: product } } });

            if (!stock) {
                throw new NotFoundException(`Stock with ID ${id} not found`);
            }
            stock.quantity = stock.quantity - quantity;
            stock.inStock = stock.quantity > 1 ? true : false;

            await this.stocksRepository.remove(stock);
        } catch (error) {
            throw new NotFoundException(`Error removing stock: ${error.message}`);
        }
    }
}

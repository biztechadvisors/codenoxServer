import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Stocks } from './entities/stocks.entity';
import { CreateStocksDto, GetStocksDto } from './dto/create-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Dealer } from 'src/users/entities/dealer.entity';
import { error } from 'console';
import { throwError } from 'rxjs';

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

    async create(createStocksDto: CreateStocksDto): Promise<Stocks[]> {
        try {
            const { user_id, products } = createStocksDto;

            const dealer = await this.userRepository.findOne({ where: { id: user_id }, relations: ['dealer'] })
            console.log('dealer****', dealer)
            if (!dealer?.dealer) {
                throw new NotFoundException(`Dealer not Found by ${user_id} ID`)
            }

            console.log('dealer****33', dealer)
            // Fetch existing stocks for the given user
            const existingStocks = await this.stocksRepository.find({
                where: { user: { id: user_id } },
                relations: ['product'],
            });

            const updatedStocks: Stocks[] = [];

            for (const product of products) {
                const existingStock = existingStocks.find(
                    (stock) => stock.product.id === product.product_id,
                );

                console.log("existingStock***", existingStock)

                if (!existingStock) {
                    // Create a new stock record for the product
                    const newStock = this.stocksRepository.create({
                        quantity: product.order_quantity,
                        inStock: true, // You might need to set this based on your logic
                        product: product.product_id, // Update this line
                        user: dealer,
                    });

                    updatedStocks.push(await this.stocksRepository.save(newStock));
                } else {
                    // Update existing stock record for the product
                    existingStock.quantity += product.order_quantity;
                    existingStock.inStock = true; // You might need to set this based on your logic

                    updatedStocks.push(await this.stocksRepository.save(existingStock));
                }
            }

            return updatedStocks;
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


    async afterORD(GetStocksDto: GetStocksDto): Promise<void> {
        try {
            const existingStocks = await this.stocksRepository.find({
                where: { user: { id: GetStocksDto.user_id }, product: { id: In(GetStocksDto.products.map(product => product.product_id)) } },
                relations: ['product'],
            });

            for (const orderProduct of GetStocksDto.products) {
                const stock = existingStocks.find(s => s.product.id === orderProduct.product_id);

                if (!stock) {
                    throw new NotFoundException(`Stock with product ID ${orderProduct.product_id} not found for user ${GetStocksDto.user_id}`);
                }
                if (stock.quantity <= orderProduct.order_quantity) {
                    stock.quantity -= orderProduct.order_quantity;
                }
                stock.inStock = stock.quantity > 0 ? true : false;

                await this.stocksRepository.save(stock);
            }
        } catch (error) {
            throw new NotFoundException(`Error updating stock after order: ${error.message}`);
        }
    }
}

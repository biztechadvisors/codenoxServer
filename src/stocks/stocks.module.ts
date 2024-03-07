/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { StocksController } from './stocks.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attachment } from 'src/common/entities/attachment.entity'
import { User } from 'src/users/entities/user.entity'
import { Product } from 'src/products/entities/product.entity'
import { Stocks } from './entities/stocks.entity'
import { StocksService } from './stocks.service'
import { Dealer } from 'src/users/entities/dealer.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Attachment, User, Product, Stocks, Dealer])],
    controllers: [
        StocksController,
    ],
    providers: [StocksService],
})
export class StocksModule { }
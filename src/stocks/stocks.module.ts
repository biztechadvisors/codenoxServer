/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { StocksController } from './stocks.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Attachment } from 'src/common/entities/attachment.entity'
import { User } from 'src/users/entities/user.entity'
import { OrderProductPivot, Product, Variation } from 'src/products/entities/product.entity'
import { InventoryStocks, Stocks } from './entities/stocks.entity'
import { StocksService } from './stocks.service'
import { Dealer } from 'src/users/entities/dealer.entity'
import { UserAddress } from 'src/addresses/entities/address.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { OrderStatus } from 'src/orders/entities/order-status.entity'
import { Coupon } from 'src/coupons/entities/coupon.entity'
import { ShiprocketService } from 'src/orders/shiprocket.service'
import { MailService } from 'src/mail/mail.service'
import { StocksSellOrd } from './entities/stocksOrd.entity'
import { Permission } from 'src/permission/entities/permission.entity'
import { Order } from 'src/orders/entities/order.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Attachment, Permission, StocksSellOrd, User, Product, OrderStatus, OrderProductPivot, Coupon, Stocks, Dealer, UserAddress, Shop, InventoryStocks, Variation, Order])],
    controllers: [
        StocksController,
    ],
    providers: [StocksService, ShiprocketService, MailService],
})
export class StocksModule { }
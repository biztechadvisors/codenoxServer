/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { RefundsService } from './refunds.service'
import { RefundsController } from './refunds.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Refund } from './entities/refund.entity'
import { AnalyticsService } from '../analytics/analytics.service'
import { Order } from '../orders/entities/order.entity'
import { Shop } from '../shops/entities/shop.entity'
import { User } from '../users/entities/user.entity'
import { Analytics, TotalYearSaleByMonth } from '../analytics/entities/analytics.entity'
import { Permission } from '../permission/entities/permission.entity'
import { StocksSellOrd } from '../stocks/entities/stocksOrd.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { CacheService } from '../helpers/cacheService'

@Module({
  imports: [TypeOrmModule.forFeature([Refund, Order, Shop, User, Analytics, Permission, StocksSellOrd, TotalYearSaleByMonth]),
  CacheModule.register(),
  ],
  controllers: [RefundsController],
  providers: [RefundsService, AnalyticsService, CacheService],
})
export class RefundsModule { }

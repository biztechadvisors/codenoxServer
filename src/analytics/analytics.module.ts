import { Module } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity'
import { Order } from 'src/orders/entities/order.entity'
import { Shop } from 'src/shops/entities/shop.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Analytics, TotalYearSaleByMonth, Order, Shop])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule { }

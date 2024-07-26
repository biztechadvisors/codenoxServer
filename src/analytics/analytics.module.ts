import { Module } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Analytics, TotalYearSaleByMonth } from './entities/analytics.entity'
import { Order } from 'src/orders/entities/order.entity'
import { Shop } from 'src/shops/entities/shop.entity'
import { User } from 'src/users/entities/user.entity'
import { Permission } from 'src/permission/entities/permission.entity'
import { UserAddressRepository } from 'src/addresses/addresses.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { UserAddress } from 'src/addresses/entities/address.entity'
import { JwtModule } from '@nestjs/jwt'
import { StocksSellOrd } from 'src/stocks/entities/stocksOrd.entity'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([UserAddressRepository]), TypeOrmModule.forFeature([Analytics, TotalYearSaleByMonth, Order, Shop, User, Permission, UserAddress, StocksSellOrd]),
  JwtModule.register({}),],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule { }

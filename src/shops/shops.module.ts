/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { ShopsService } from './shops.service'
import {
  ApproveShopController,
  DisapproveShopController,
  ShopsController,
  StaffsController,
  // StaffsController,
} from './shops.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentInfo, Shop } from './entities/shop.entity'
import { Balance } from './entities/balance.entity'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { Add, UserAdd } from 'src/address/entities/address.entity'
import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import { User } from 'src/users/entities/user.entity'
import { ShopSettings } from './entities/shopSettings.entity'
import { Attachment } from 'src/common/entities/attachment.entity'
import { AddressesService } from 'src/address/addresses.service'
import { Permission } from 'src/permission/entities/permission.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { AnalyticsService } from '../analytics/analytics.service'
import { Order } from '../orders/entities/order.entity'
import { Analytics, TotalYearSaleByMonth } from '../analytics/entities/analytics.entity'
import { StocksSellOrd } from '../stocks/entities/stocksOrd.entity'
import { Refund } from '../refunds/entities/refund.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, Balance, PaymentInfo, Add, Location, ShopSocials, User, ShopSettings, Attachment, UserAdd, Permission, Order, Analytics, Permission, StocksSellOrd, TotalYearSaleByMonth, Refund]),
    CacheModule.register(),
  ],
  controllers: [ShopsController, StaffsController, DisapproveShopController, ApproveShopController],
  providers: [ShopsService, AnalyticsService, AddressesService],
})
export class ShopsModule { }

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { ShopsService } from './shops.service'
import {
  ApproveShopController,
  DisapproveShopController,
  ShopsController,
  StaffsController,
} from './shops.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentInfo, Shop } from './entities/shop.entity'
import { Balance } from './entities/balance.entity'
import { BalanceRepository, PaymentInfoRepository, ShopRepository, ShopSettingsRepository } from './shops.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([
    ShopRepository,
    BalanceRepository,
    ShopSettingsRepository,
    PaymentInfoRepository
  ]),TypeOrmModule.forFeature([Shop, Balance, PaymentInfo])],
  controllers: [
    ShopsController,
    StaffsController,
    DisapproveShopController,
    ApproveShopController,
  ],
  providers: [ShopsService],
})
export class ShopsModule {}

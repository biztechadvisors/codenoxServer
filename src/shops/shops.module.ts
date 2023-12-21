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
import { AddressRepository, BalanceRepository, LocationRepository, PaymentInfoRepository, ShopRepository, ShopSettingsRepository, ShopSocialRepository } from './shops.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { Address } from 'src/addresses/entities/address.entity'
import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import { UserRepository } from 'src/users/users.repository'
import { User } from 'src/users/entities/user.entity'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([
    ShopRepository,
    BalanceRepository,
    ShopSettingsRepository,
    PaymentInfoRepository,
    AddressRepository,
    LocationRepository,
    ShopSocialRepository,
    UserRepository
  ]),TypeOrmModule.forFeature([Shop, Balance, PaymentInfo, Address, Location, ShopSocials, User])],
  controllers: [
    ShopsController,
    StaffsController,
    DisapproveShopController,
    ApproveShopController,
  ],
  providers: [ShopsService],
})
export class ShopsModule {}

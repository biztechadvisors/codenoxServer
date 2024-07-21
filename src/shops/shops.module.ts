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
import { AddressRepository, BalanceRepository, LocationRepository, PaymentInfoRepository, ShopRepository, ShopSettingsRepository, ShopSocialsRepository } from './shops.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { Address, UserAddress } from 'src/addresses/entities/address.entity'
import { Location, ShopSocials } from 'src/settings/entities/setting.entity'
import { UserRepository } from 'src/users/users.repository'
import { User } from 'src/users/entities/user.entity'
import { ShopSettings } from './entities/shopSettings.entity'
import { AttachmentRepository } from 'src/common/common.repository'
import { Attachment } from 'src/common/entities/attachment.entity'
import { AddressesService } from 'src/addresses/addresses.service'
import { UserAddressRepository } from 'src/addresses/addresses.repository'
import { Permission } from 'src/permission/entities/permission.entity'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([
    ShopRepository,
    BalanceRepository,
    ShopSettingsRepository,
    PaymentInfoRepository,
    AddressRepository,
    LocationRepository,
    ShopSocialsRepository,
    UserRepository,
    AttachmentRepository,
    UserAddressRepository,
  ]), TypeOrmModule.forFeature([Shop, Balance, PaymentInfo, Address, Location, ShopSocials, User, ShopSettings, Attachment, UserAddress, Permission])],
  controllers: [
    ShopsController,
    StaffsController,
    DisapproveShopController,
    ApproveShopController,
  ],
  providers: [ShopsService, AddressesService],
})
export class ShopsModule { }
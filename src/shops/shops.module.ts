import { Module } from '@nestjs/common'
import { ShopsService } from './shops.service'
import {
  ApproveShopController,
  DisapproveShopController,
  ShopsController,
  StaffsController,
} from './shops.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Shop } from './entities/shop.entity'
import { Balance } from './entities/balance.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Shop, Balance])],
  controllers: [
    ShopsController,
    StaffsController,
    DisapproveShopController,
    ApproveShopController,
  ],
  providers: [ShopsService],
})
export class ShopsModule {}

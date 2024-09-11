/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { WithdrawsService } from './withdraws.service'
import { WithdrawsController } from './withdraws.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Withdraw } from './entities/withdraw.entity'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { Balance } from 'src/shops/entities/balance.entity'
import { Shop } from 'src/shops/entities/shop.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdraw, Balance, Shop])],
  controllers: [WithdrawsController],
  providers: [WithdrawsService],
})
export class WithdrawsModule { }

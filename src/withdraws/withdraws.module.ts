import { Module } from '@nestjs/common'
import { WithdrawsService } from './withdraws.service'
import { WithdrawsController } from './withdraws.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Withdraw } from './entities/withdraw.entity'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { WithdrawRepository } from './withdraws.repository'
import { BalanceRepository } from 'src/shops/shops.repository'
import { Balance } from 'src/shops/entities/balance.entity'

@Module({
  imports: [TypeOrmExModule.forCustomRepository([
    WithdrawRepository,
    BalanceRepository
  ]),
  TypeOrmModule.forFeature([Withdraw, Balance])],
  controllers: [WithdrawsController],
  providers: [WithdrawsService],
})
export class WithdrawsModule {}

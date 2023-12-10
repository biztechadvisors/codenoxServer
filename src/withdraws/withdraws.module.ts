/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { WithdrawsService } from './withdraws.service'
import { WithdrawsController } from './withdraws.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Withdraw } from './entities/withdraw.entity'
import { WithdrawRepository } from './withdraws.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([
      WithdrawRepository,
    ]),
    TypeOrmModule.forFeature([Withdraw])],
  controllers: [WithdrawsController],
  providers: [WithdrawsService],
})
export class WithdrawsModule {}

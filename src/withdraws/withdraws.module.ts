import { Module } from '@nestjs/common'
import { WithdrawsService } from './withdraws.service'
import { WithdrawsController } from './withdraws.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Withdraw } from './entities/withdraw.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Withdraw])],
  controllers: [WithdrawsController],
  providers: [WithdrawsService],
})
export class WithdrawsModule {}

import { Module } from '@nestjs/common';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from './entities/refund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Refund])],
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule { }

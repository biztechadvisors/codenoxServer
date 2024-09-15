/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { AttachmentRepository } from 'src/common/common.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, Attachment])],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule { }
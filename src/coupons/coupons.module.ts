import { Module } from '@nestjs/common'
import { CouponsService } from './coupons.service'
import { CouponsController } from './coupons.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Coupon } from './entities/coupon.entity'
import { AttachmentRepository } from 'src/common/common.repository'
import { Attachment } from 'src/common/entities/attachment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, AttachmentRepository, Attachment])],
  controllers: [CouponsController],
  providers: [CouponsService, AttachmentRepository],
})
export class CouponsModule { }

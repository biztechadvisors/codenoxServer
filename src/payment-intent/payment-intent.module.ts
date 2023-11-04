import { Module } from '@nestjs/common'
import { PaymentIntentController } from './payment-intent.controller'
import { PaymentIntentService } from './payment-intent.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PaymentIntent } from './entries/payment-intent.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PaymentIntent])],
  controllers: [PaymentIntentController],
  providers: [PaymentIntentService],
})
export class PaymentIntentModule {}

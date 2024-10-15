/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { AbandonedCartController } from './carts.controller'
import { AbandonedCartService } from './carts.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cart } from './entities/cart.entity'
import { MailService } from 'src/mail/mail.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
  ],
  controllers: [AbandonedCartController],
  providers: [AbandonedCartService, MailService],
})
export class CartsModule { }

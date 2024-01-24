/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { AbandonedCartController } from './carts.controller'
import { AbandonedCartService } from './carts.service'
import { CartRepository } from './carts.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Cart } from './entities/cart.entity'
import { MailService } from 'src/mail/mail.service'

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([CartRepository]),
    TypeOrmModule.forFeature([Cart]),
  ],
  controllers: [AbandonedCartController],
  providers: [AbandonedCartService, MailService],
})
export class CartsModule {}

<<<<<<< HEAD
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ShippingsService } from './shippings.service';
import { ShippingsController } from './shippings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
=======
import { Module } from '@nestjs/common'
import { ShippingsService } from './shippings.service'
import { ShippingsController } from './shippings.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Shipping } from './entities/shipping.entity'
>>>>>>> 6e28216ba071c18075e0820b6c10a9f57ef0b35f

@Module({
  imports: [TypeOrmModule.forFeature([Shipping])],
  controllers: [ShippingsController],
  providers: [ShippingsService],
})
export class ShippingsModule {}

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressRepository, UserAddressRepository } from './addresses.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { UserRepository } from 'src/users/users.repository';
import { Address, UserAddress } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { ShopRepository } from 'src/shops/shops.repository';
import { Shop } from 'src/shops/entities/shop.entity';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([AddressRepository, ShopRepository, UserAddressRepository, UserRepository]), TypeOrmModule.forFeature([Address, UserAddress, User, Shop]),],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService]
})
export class AddressesModule { }
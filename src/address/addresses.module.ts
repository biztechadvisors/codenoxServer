import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Add, UserAdd } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { CacheService } from '../helpers/cacheService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Add, UserAdd, User, Shop]),
    CacheModule.register(),
  ],
  controllers: [AddressesController],
  providers: [AddressesService, CacheService],
  exports: [AddressesService],
})
export class AddModule { }

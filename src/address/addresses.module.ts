import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Add, UserAdd } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Add, UserAdd, User, Shop]),
    CacheModule.register(), // CacheModule is ready to cache data
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddModule { }

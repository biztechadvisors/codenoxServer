import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

import { Add, UserAdd } from './entities/address.entity';
import { User } from 'src/users/entities/user.entity';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { CacheService } from '../helpers/cacheService';

@Module({
  imports: [
    TypeOrmModule.forFeature([Add, UserAdd, User]),
    CacheModule.register({
      ttl: 3600,
      max: 100,
    }),
  ],
  controllers: [AddressesController],
  providers: [AddressesService, CacheService],
  exports: [AddressesService],
})
export class AddModule { }

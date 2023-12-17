<<<<<<< HEAD
import { Module } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { StoreNoticesController } from './store-notices.controller';
import { StoreNoticesService } from './store-notices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealerRepository, UserRepository } from 'src/users/users.repository';
import { AddressesModule } from 'src/addresses/addresses.module';
import { AddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from 'src/users/profile.repository';
import { AttachmentRepository } from 'src/common/common.repository';
import { StoreNotice } from './entities/store-notices.entity';
=======
import { Module } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { StoreNoticesController } from './store-notices.controller'
import { StoreNoticesService } from './store-notices.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from 'src/users/users.repository'
import { AddressesModule } from 'src/addresses/addresses.module'
import { AddressRepository } from 'src/addresses/addresses.repository'
import { ProfileRepository } from 'src/users/profile.repository'
import { AttachmentRepository } from 'src/common/common.repository'
import { StoreNotice } from './entities/store-notices.entity'
>>>>>>> 62c223d7ff2bbe988672e7b1af7d7826c0d3e022

@Module({
  imports: [AddressesModule, TypeOrmModule.forFeature([StoreNotice])],
  providers: [
<<<<<<< HEAD
    UserRepository, AddressRepository, ProfileRepository, AttachmentRepository, DealerRepository],
=======
    UsersService,
    UserRepository,
    AddressRepository,
    ProfileRepository,
    AttachmentRepository,
  ],
>>>>>>> 62c223d7ff2bbe988672e7b1af7d7826c0d3e022
})
export class StoreNoticesModule {}

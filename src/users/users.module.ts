/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ProfilesController, SocialController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialRepository, UserRepository } from './users.repository';
import { AddressRepository, UserAddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { AttachmentRepository } from 'src/common/common.repository';
import { User } from './entities/user.entity';
import { Profile, Social } from './entities/profile.entity';
import { Address, UserAddress } from 'src/addresses/entities/address.entity';

@Module({
  imports: [TypeOrmExModule.forCustomRepository([UserRepository, UserAddressRepository, AddressRepository, ProfileRepository,SocialRepository, AttachmentRepository]), TypeOrmModule.forFeature([User, Profile,UserAddress,Address,Social])],
  controllers: [UsersController, ProfilesController, SocialController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
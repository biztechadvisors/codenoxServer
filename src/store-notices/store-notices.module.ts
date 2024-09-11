/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesModule } from 'src/addresses/addresses.module';
import { StoreNotice } from './entities/store-notices.entity';
import { User } from '../users/entities/user.entity';
import { Address } from '../addresses/entities/address.entity';
import { Profile } from '../users/entities/profile.entity';
import { Attachment } from '../common/entities/attachment.entity';
import { Dealer } from '../users/entities/dealer.entity';

@Module({
  imports: [AddressesModule, TypeOrmModule.forFeature([StoreNotice, User, Address, Profile, Attachment, Dealer])],
  providers: [],
})
export class StoreNoticesModule { }

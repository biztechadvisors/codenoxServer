/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddModule } from 'src/address/addresses.module';
import { StoreNotice } from './entities/store-notices.entity';
import { User } from '../users/entities/user.entity';
import { Add } from '../address/entities/address.entity';
import { Profile } from '../users/entities/profile.entity';
import { Attachment } from '../common/entities/attachment.entity';
import { Dealer } from '../users/entities/dealer.entity';

@Module({
  imports: [AddModule, TypeOrmModule.forFeature([StoreNotice, User, Add, Profile, Attachment, Dealer])],
  providers: [],
})
export class StoreNoticesModule { }

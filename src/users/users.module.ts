import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { ProfilesController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { AddressRepository } from 'src/addresses/addresses.repository';
import { ProfileRepository } from './profile.repository';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';

@Module({
  // imports: [
  //   TypeOrmModule.forFeature([UserRepository, AddressRepository, ProfileRepository]),
  // ],
  imports: [TypeOrmExModule.forCustomRepository([UserRepository, AddressRepository, ProfileRepository])],
  controllers: [UsersController, ProfilesController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }

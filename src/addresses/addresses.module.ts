import { Module } from '@nestjs/common'
import { AddressesService } from './addresses.service'
import { AddressesController } from './addresses.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AddressRepository } from './addresses.repository'
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module'
import { UserRepository } from 'src/users/users.repository'
import { Address } from './entities/address.entity'

@Module({
  imports: [
    TypeOrmExModule.forCustomRepository([AddressRepository]),
    TypeOrmModule.forFeature([Address]),
  ],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}

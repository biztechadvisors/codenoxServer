/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Region } from './entities/region.entity'
import { RegionController } from './region.controller'
import { RegionService } from './region.service'

@Module({
    imports: [TypeOrmModule.forFeature([Region])],
    controllers: [RegionController],
    providers: [RegionService],
})
export class RegionModule { }

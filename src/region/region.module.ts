/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Region } from './entities/region.entity'
import { RegionController } from './region.controller'
import { RegionService } from './region.service'
import { Shop } from '../shops/entities/shop.entity'
import { CacheService } from '../helpers/cacheService'

@Module({
    imports: [TypeOrmModule.forFeature([Region, Shop])],
    controllers: [RegionController],
    providers: [RegionService, CacheService],
})
export class RegionModule { }

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Region } from './entities/region.entity'
import { RegionController } from './region.controller'
import { RegionService } from './region.service'
import { Shop } from '../shops/entities/shop.entity'
import { CacheService } from '../helpers/cacheService'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
    imports: [TypeOrmModule.forFeature([Region, Shop]), CacheModule.register(),],
    controllers: [RegionController],
    providers: [RegionService, CacheService],
})
export class RegionModule { }

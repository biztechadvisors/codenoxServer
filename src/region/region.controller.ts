import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';
import { RegionService } from './region.service';
import { Region } from './entities/region.entity';
import { CacheService } from '../helpers/cacheService';

@Controller('regions')
export class RegionController {
    constructor(private readonly regionService: RegionService, private readonly cacheService: CacheService) { }

    @Post()
    async create(@Body() createRegionDto: CreateRegionDto): Promise<Region> {
        await this.cacheService.invalidateCacheBySubstring('regions')
        return this.regionService.createRegion(createRegionDto);
    }

    @Get('shop/:shopSlug')
    async findAllRegionByShop(@Param('shopSlug') shopSlug: string): Promise<Region[]> {
        return this.regionService.findAllRegionByShop(shopSlug);
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Region> {
        return this.regionService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateRegionDto: UpdateRegionDto): Promise<Region> {
        await this.cacheService.invalidateCacheBySubstring('regions')
        return this.regionService.update(id, updateRegionDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring('regions')
        return this.regionService.remove(id);
    }
}

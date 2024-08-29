import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';
import { RegionService } from './region.service';
import { Region } from './entities/region.entity';

@Controller('regions')
export class RegionController {
    constructor(private readonly regionService: RegionService) { }

    @Post()
    async create(@Body() createRegionDto: CreateRegionDto) {
        return this.regionService.create(createRegionDto);
    }

    @Get('shop/:shopSlug')
    async findAll(@Param('shopSlug') shopSlug: string): Promise<Region[]> {
        return this.regionService.findAll(shopSlug);
    }

    @Get(':id')
    async findOne(@Param('id') id: number) {
        return this.regionService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateRegionDto: UpdateRegionDto) {
        return this.regionService.update(id, updateRegionDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.regionService.remove(id);
    }
}

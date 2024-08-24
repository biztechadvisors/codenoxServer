import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateRegionDto, UpdateRegionDto } from './dto/create-region.dto';
import { RegionService } from './region.service';

@Controller('regions')
export class RegionController {
    constructor(private readonly regionService: RegionService) { }

    @Post()
    async create(@Body() createRegionDto: CreateRegionDto) {
        return this.regionService.create(createRegionDto);
    }

    @Get()
    async findAll() {
        return this.regionService.findAll();
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

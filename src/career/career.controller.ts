import { Controller, Post, Body, Param, Put, Delete, Get, Query } from '@nestjs/common';
import { CareerService } from './career.service';
import { CreateCareerDto, UpdateCareerDto } from './dto/createcareer.dto';
import { Career } from './entities/career.entity';

@Controller('careers')
export class CareerController {
    constructor(private readonly careerService: CareerService) { }

    @Post()
    create(@Body() createCareerDto: CreateCareerDto): Promise<Career> {
        return this.careerService.createCareer(createCareerDto);
    }

    @Get('shop/:shopSlug')
    findAllByShop(
        @Param('shopSlug') shopSlug: string,
        @Query('location') location?: string, // Optional query parameter for location
        @Query('page') page: number = 1,     // Default to page 1
        @Query('limit') limit: number = 10   // Default to 10 items per page
    ): Promise<{ data: Career[], count: number }> {
        return this.careerService.findAllByShop(shopSlug, location, page, limit);
    }


    @Get(':id')
    findOne(@Param('id') id: number): Promise<Career> {
        return this.careerService.getCareerById(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateCareerDto: UpdateCareerDto): Promise<Career> {
        return this.careerService.updateCareer(id, updateCareerDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number): Promise<void> {
        return this.careerService.deleteCareer(id);
    }
}
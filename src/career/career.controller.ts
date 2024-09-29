import { Controller, Post, Body, Param, Put, Delete, Get, Query } from '@nestjs/common';
import { CareerService } from './career.service';
import { CreateCareerDto, UpdateCareerDto } from './dto/createcareer.dto';
import { Career } from './entities/career.entity';
import { Vacancy } from './entities/vacancies.entity';
import { CreateVacancyDto, FindVacanciesDto, UpdateVacancyDto } from './dto/createvacancy.dto';
import { CacheService } from '../helpers/cacheService';

@Controller('careers')
export class CareerController {
    constructor(private readonly careerService: CareerService, private readonly cacheService: CacheService) { }

    @Post()
    async create(@Body() createCareerDto: CreateCareerDto): Promise<Career> {
        await this.cacheService.invalidateCacheBySubstring("careers")
        return this.careerService.createCareer(createCareerDto);
    }

    @Get('shop/:shopSlug')
    findAllByShop(
        @Param('shopSlug') shopSlug: string,
        @Query('location') location?: string,
        @Query('vacancyTitle') vacancyTitle?: string, // New optional query parameter
        @Query('position') position?: string,         // New optional query parameter
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<{ data: Career[], count: number }> {
        return this.careerService.findAllByShop(shopSlug, location, vacancyTitle, position, page, limit);
    }


    @Get(':id')
    findOne(@Param('id') id: number): Promise<Career> {
        return this.careerService.getCareerById(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateCareerDto: UpdateCareerDto): Promise<Career> {
        await this.cacheService.invalidateCacheBySubstring("careers")
        return this.careerService.updateCareer(id, updateCareerDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("careers")
        return this.careerService.deleteCareer(id);
    }
}
@Controller('vacancies')
export class VacancyController {
    constructor(private readonly careerService: CareerService, private readonly cacheService: CacheService) { }

    @Post()
    async create(@Body() createVacancyDto: CreateVacancyDto): Promise<Vacancy> {
        await this.cacheService.invalidateCacheBySubstring("vacancies")
        return this.careerService.createVacancy(createVacancyDto);
    }

    @Get(':id')
    findOne(@Param('id') id: number): Promise<Vacancy> {
        return this.careerService.findVacancyById(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() updateVacancyDto: UpdateVacancyDto): Promise<Vacancy> {
        await this.cacheService.invalidateCacheBySubstring("vacancies")
        return this.careerService.updateVacancy(id, updateVacancyDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("vacancies")
        return this.careerService.deleteVacancy(id);
    }

    @Get()
    findAll(
        @Query() findVacanciesDto: FindVacanciesDto // Use the new DTO
    ): Promise<{ data: Vacancy[], count: number }> {
        const { page = 1, limit = 10, city } = findVacanciesDto;
        return this.careerService.findAllVacancies(page, limit, city);
    }

}
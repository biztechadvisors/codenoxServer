// src/get-inspired/get-inspired.controller.ts

import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { GetInspiredService } from './get-inspired.service';
import { CreateGetInspiredDto, UpdateGetInspiredDto } from './dto/create-get-inspired.dto';
import { GetInspired } from './entities/get-inspired.entity';
import { CacheService } from '../helpers/cacheService';

@Controller('get-inspired')
export class GetInspiredController {
    constructor(private readonly getInspiredService: GetInspiredService, private readonly cacheService: CacheService) { }

    @Post()
    async createGetInspired(@Body() createGetInspiredDto: CreateGetInspiredDto): Promise<GetInspired> {
        await this.cacheService.invalidateCacheBySubstring("get-inspired-shop")
        return this.getInspiredService.createGetInspired(createGetInspiredDto);
    }

    @Get('shop')
    async getAllGetInspired(
        @Query('shopSlug') shopSlug: string,
        @Query('type') type?: string, // Optional query parameter for type
        @Query('tagIds') tagIds?: string, // Optional query parameter for tagIds (comma-separated)
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<{ data: GetInspired[], total: number, page: number, limit: number }> {
        // Convert comma-separated tagIds string to an array of numbers
        const tagIdsArray = tagIds ? tagIds.split(',').map(id => parseInt(id, 10)) : [];
        return this.getInspiredService.getAllGetInspired(shopSlug, type, tagIdsArray, page, limit);
    }

    @Get(':id')
    getGetInspiredById(@Param('id') id: number): Promise<GetInspired> {
        return this.getInspiredService.getGetInspiredById(id);
    }

    @Put(':id')
    async updateGetInspired(@Param('id') id: number, @Body() updateGetInspiredDto: UpdateGetInspiredDto): Promise<GetInspired> {
        await this.cacheService.invalidateCacheBySubstring("get-inspired-shop")
        return this.getInspiredService.updateGetInspired(id, updateGetInspiredDto);
    }

    @Delete(':id')
    async deleteGetInspired(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("get-inspired-shop")
        return this.getInspiredService.deleteGetInspired(id);
    }
}

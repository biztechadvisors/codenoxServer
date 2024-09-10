// src/get-inspired/get-inspired.controller.ts

import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { GetInspiredService } from './get-inspired.service';
import { CreateGetInspiredDto, UpdateGetInspiredDto } from './dto/create-get-inspired.dto';
import { GetInspired } from './entities/get-inspired.entity';

@Controller('get-inspired')
export class GetInspiredController {
    constructor(private readonly getInspiredService: GetInspiredService) { }

    @Post()
    createGetInspired(@Body() createGetInspiredDto: CreateGetInspiredDto): Promise<GetInspired> {
        return this.getInspiredService.createGetInspired(createGetInspiredDto);
    }

    @Get('shop/:shopSlug')
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
    updateGetInspired(@Param('id') id: number, @Body() updateGetInspiredDto: UpdateGetInspiredDto): Promise<GetInspired> {
        return this.getInspiredService.updateGetInspired(id, updateGetInspiredDto);
    }

    @Delete(':id')
    deleteGetInspired(@Param('id') id: number): Promise<void> {
        return this.getInspiredService.deleteGetInspired(id);
    }
}

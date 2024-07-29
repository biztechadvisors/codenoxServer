// src/get-inspired/get-inspired.controller.ts

import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
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
    getAllGetInspired(@Param('shopSlug') shopSlug: string): Promise<GetInspired[]> {
        return this.getInspiredService.getAllGetInspired(shopSlug);
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

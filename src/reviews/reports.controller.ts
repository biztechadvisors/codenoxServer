/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AbusiveReportService } from './reports.service';
import { CacheService } from '../helpers/cacheService';

@Controller('abusive_reports')
export class AbusiveReportsController {
  constructor(private reportService: AbusiveReportService, private readonly cacheService: CacheService) { }

  @Get()
  async findAll(@Query('shopSlug') shopSlug?: string, @Query('userId') userId?: number, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reportService.findAllReports(shopSlug, userId, page, limit);
  }

  // get single feedback
  @Get(':id')
  find(@Param('id') id: number) {
    return this.reportService.findReport(id);
  }

  // create a new feedback
  @Post()
  async create(@Body() createReportDto: CreateReportDto) {
    await this.cacheService.invalidateCacheBySubstring('abusive_reports')
    return this.reportService.create(createReportDto);
  }

  // update a feedback
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    await this.cacheService.invalidateCacheBySubstring('abusive_reports')
    return this.reportService.update(+id, updateReportDto);
  }

  // delete a feedback
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.cacheService.invalidateCacheBySubstring('abusive_reports')
    return this.reportService.delete(+id);
  }
}
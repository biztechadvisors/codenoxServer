import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { FAQService } from './faq.service';
import { FAQ } from './entities/faq.entity';
import { QnA, QnAType } from './entities/qna.entity';
import { CreateFAQDto, UpdateFAQDto } from './dto/createfaqdto.dto';
import { CreateQnADto, UpdateQnADto } from './dto/createqnadto.dto';
import { CacheService } from '../helpers/cacheService';

@Controller('faqs')
export class FAQController {
    constructor(private readonly faqService: FAQService, private readonly cacheService: CacheService) { }

    @Post()
    async createFAQ(@Body() createFAQDto: CreateFAQDto): Promise<FAQ> {
        await this.cacheService.invalidateCacheBySubstring("faqs")
        return this.faqService.createFAQ(createFAQDto);
    }

    @Get(':id')
    getFAQById(@Param('id') id: number): Promise<FAQ> {
        return this.faqService.getFAQById(id);
    }

    @Get('shop/:shopSlug')
    async getFAQsByShopSlug(
        @Param('shopSlug') shopSlug: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<{ data: FAQ[], total: number, page: number, limit: number }> {
        return this.faqService.getFAQsByShopSlug(shopSlug, page, limit);
    }

    @Put(':id')
    async updateFAQ(@Param('id') id: number, @Body() updateFAQDto: UpdateFAQDto): Promise<FAQ> {
        await this.cacheService.invalidateCacheBySubstring("faqs")
        return this.faqService.updateFAQ(id, updateFAQDto);
    }

    @Delete(':id')
    async deleteFAQ(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("faqs")
        return this.faqService.deleteFAQ(id);
    }

    @Post(':faqId/qna')
    async addQnA(@Param('faqId') faqId: number, @Body() createQnADto: CreateQnADto): Promise<QnA> {
        await this.cacheService.invalidateCacheBySubstring("faqs")
        return this.faqService.addQnAToFAQ(faqId, createQnADto);
    }

    @Put('qna/:id')
    async updateQnA(@Param('id') id: number, @Body() updateQnADto: UpdateQnADto): Promise<QnA> {
        await this.cacheService.invalidateCacheBySubstring("faqs")
        return this.faqService.updateQnA(id, updateQnADto);
    }

    @Delete('qna/:id')
    async deleteQnA(@Param('id') id: number): Promise<void> {
        await this.cacheService.invalidateCacheBySubstring("faqs")
        return this.faqService.deleteQnA(id);
    }

    @Get(':faqId/qnas')
    getQnAsByFAQId(@Param('faqId') faqId: number): Promise<QnA[]> {
        return this.faqService.getQnAsByFAQId(faqId);
    }

    @Get('shop/:shopSlug/qnas')
    async getQnAsByShopId(
        @Param('shopSlug') shopSlug: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<{ data: QnA[], total: number, page: number, limit: number }> {
        return this.faqService.getQnAsByShopId(shopSlug, page, limit);
    }
}

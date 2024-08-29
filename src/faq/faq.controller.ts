import { Controller, Post, Get, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { FAQService } from './faq.service';
import { FAQ } from './entities/faq.entity';
import { QnA, QnAType } from './entities/qna.entity';
import { CreateFAQDto, UpdateFAQDto } from './dto/createfaqdto.dto';
import { CreateQnADto, UpdateQnADto } from './dto/createqnadto.dto';

@Controller('faqs')
export class FAQController {
    constructor(private readonly faqService: FAQService) { }

    @Post()
    createFAQ(@Body() createFAQDto: CreateFAQDto): Promise<FAQ> {
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
    updateFAQ(@Param('id') id: number, @Body() updateFAQDto: UpdateFAQDto): Promise<FAQ> {
        return this.faqService.updateFAQ(id, updateFAQDto);
    }

    @Delete(':id')
    deleteFAQ(@Param('id') id: number): Promise<void> {
        return this.faqService.deleteFAQ(id);
    }

    @Post(':faqId/qna')
    addQnA(@Param('faqId') faqId: number, @Body() createQnADto: CreateQnADto): Promise<QnA> {
        return this.faqService.addQnAToFAQ(faqId, createQnADto);
    }

    @Put('qna/:id')
    updateQnA(@Param('id') id: number, @Body() updateQnADto: UpdateQnADto): Promise<QnA> {
        return this.faqService.updateQnA(id, updateQnADto);
    }

    @Delete('qna/:id')
    deleteQnA(@Param('id') id: number): Promise<void> {
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

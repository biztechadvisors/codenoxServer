import { FAQService } from './faq.service';
import { FAQ } from './entities/faq.entity';
import { QnA } from './entities/qna.entity';
import { CreateFAQDto, UpdateFAQDto } from './dto/createfaqdto.dto';
import { CreateQnADto, UpdateQnADto } from './dto/createqnadto.dto';
export declare class FAQController {
    private readonly faqService;
    constructor(faqService: FAQService);
    createFAQ(createFAQDto: CreateFAQDto): Promise<FAQ>;
    getFAQById(id: number): Promise<FAQ>;
    getFAQsByShopSlug(shopSlug: string, page?: number, limit?: number): Promise<{
        data: FAQ[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateFAQ(id: number, updateFAQDto: UpdateFAQDto): Promise<FAQ>;
    deleteFAQ(id: number): Promise<void>;
    addQnA(faqId: number, createQnADto: CreateQnADto): Promise<QnA>;
    updateQnA(id: number, updateQnADto: UpdateQnADto): Promise<QnA>;
    deleteQnA(id: number): Promise<void>;
    getQnAsByFAQId(faqId: number): Promise<QnA[]>;
    getQnAsByShopId(shopSlug: string, page?: number, limit?: number): Promise<{
        data: QnA[];
        total: number;
        page: number;
        limit: number;
    }>;
}

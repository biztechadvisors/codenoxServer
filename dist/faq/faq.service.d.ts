import { Repository } from 'typeorm';
import { FAQ } from './entities/faq.entity';
import { QnA } from './entities/qna.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { Cache } from 'cache-manager';
import { CreateQnADto } from './dto/createqnadto.dto';
export declare class FAQService {
    private readonly faqRepository;
    private readonly qnaRepository;
    private readonly attachmentRepository;
    private readonly cacheManager;
    constructor(faqRepository: Repository<FAQ>, qnaRepository: Repository<QnA>, attachmentRepository: Repository<Attachment>, cacheManager: Cache);
    createFAQ(createFAQDto: any): Promise<FAQ>;
    getFAQById(id: number): Promise<FAQ>;
    getFAQsByShopSlug(shopSlug: string, page?: number, limit?: number): Promise<{
        data: FAQ[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateFAQ(id: number, updateFAQDto: any): Promise<FAQ>;
    deleteFAQ(id: number): Promise<void>;
    addQnAToFAQ(faqId: number, createQnADto: CreateQnADto): Promise<QnA>;
    updateQnA(id: number, updateQnADto: any): Promise<QnA>;
    deleteQnA(id: number): Promise<void>;
    getQnAsByFAQId(faqId: number): Promise<QnA[]>;
    getQnAsByShopId(shopSlug: string, page?: number, limit?: number): Promise<{
        data: QnA[];
        total: number;
        page: number;
        limit: number;
    }>;
}

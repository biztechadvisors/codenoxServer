import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FAQ } from './entities/faq.entity';
import { QnA, QnAType } from './entities/qna.entity';
import { Attachment } from 'src/common/entities/attachment.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager'
import { CreateQnADto } from './dto/createqnadto.dto';

@Injectable()
export class FAQService {
    constructor(
        @InjectRepository(FAQ)
        private readonly faqRepository: Repository<FAQ>,
        @InjectRepository(QnA)
        private readonly qnaRepository: Repository<QnA>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) { }

    async createFAQ(createFAQDto: any): Promise<FAQ> {
        const { title, description, shop_id, imageIds, qnas } = createFAQDto;
        console.log(title, description, shop_id, imageIds, qnas)
        const faq = this.faqRepository.create({
            title,
            description,
            shop: { id: shop_id },
            images: imageIds ? await this.attachmentRepository.findByIds(imageIds) : [],
            qnas: qnas ? await Promise.all(qnas.map(qna => this.qnaRepository.create(qna))) : [],
        });

        return this.faqRepository.save(faq);
    }

    async getFAQById(id: number): Promise<FAQ> {
        const cacheKey = `faq-${id}`;
        let faq = await this.cacheManager.get<FAQ>(cacheKey);

        if (!faq) {
            faq = await this.faqRepository.findOne({
                where: { id },
                relations: ['shop', 'images', 'qnas'],
            });

            if (!faq) {
                throw new NotFoundException(`FAQ with ID ${id} not found`);
            }

            await this.cacheManager.set(cacheKey, faq, 3600); // Cache for 1 hour
        }

        return faq;
    }

    async getFAQsByShopSlug(
        shopSlug: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: FAQ[], total: number, page: number, limit: number }> {
        const cacheKey = `faqs-${shopSlug}-page-${page}-limit-${limit}`;
        let cachedResult = await this.cacheManager.get<{ data: FAQ[], total: number }>(cacheKey);

        if (cachedResult) {
            return {
                ...cachedResult,
                page,
                limit
            };
        }

        const [data, total] = await this.faqRepository
            .createQueryBuilder('faq')
            .innerJoinAndSelect('faq.shop', 'shop', 'shop.slug = :slug', { slug: shopSlug })
            .leftJoinAndSelect('faq.images', 'images')
            .leftJoinAndSelect('faq.qnas', 'qnas')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const result = { data, total, page, limit };

        await this.cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour

        return result;
    }

    async updateFAQ(id: number, updateFAQDto: any): Promise<FAQ> {
        const faq = await this.getFAQById(id);

        if (updateFAQDto.title) faq.title = updateFAQDto.title;
        if (updateFAQDto.description) faq.description = updateFAQDto.description;
        if (updateFAQDto.shopId) faq.shop = updateFAQDto.shop_id;
        if (updateFAQDto.imageIds) faq.images = await this.attachmentRepository.findByIds(updateFAQDto.imageIds);
        if (updateFAQDto.qnas) faq.qnas = await Promise.all(updateFAQDto.qnas.map(qna => this.qnaRepository.create(qna)));

        return this.faqRepository.save(faq);
    }

    async deleteFAQ(id: number): Promise<void> {
        const result = await this.faqRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`FAQ with ID ${id} not found`);
        }
    }

    async addQnAToFAQ(faqId: number, createQnADto: CreateQnADto): Promise<QnA> {
        const faq = await this.getFAQById(faqId);
        if (!faq) {
            throw new NotFoundException(`FAQ with ID ${faqId} not found`);
        }

        const qna = this.qnaRepository.create({
            ...createQnADto,
            faq,
        });

        return this.qnaRepository.save(qna);
    }


    async updateQnA(id: number, updateQnADto: any): Promise<QnA> {
        const qna = await this.qnaRepository.findOne({
            where: { id },
            relations: ['faq'],
        });
        if (!qna) {
            throw new NotFoundException(`QnA with ID ${id} not found`);
        }

        if (updateQnADto.question) qna.question = updateQnADto.question;
        if (updateQnADto.answer) qna.answer = updateQnADto.answer;
        if (updateQnADto.type) qna.type = updateQnADto.type;

        return this.qnaRepository.save(qna);
    }

    async deleteQnA(id: number): Promise<void> {
        const result = await this.qnaRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`QnA with ID ${id} not found`);
        }
    }
    async getQnAsByFAQId(faqId: number): Promise<QnA[]> {
        const cacheKey = `qnas-${faqId}`;
        let qnas = await this.cacheManager.get<QnA[]>(cacheKey);

        if (!qnas) {
            const faq = await this.getFAQById(faqId);
            qnas = await this.qnaRepository.find({ where: { faq: { id: faq.id } } });

            await this.cacheManager.set(cacheKey, qnas, 3600); // Cache for 1 hour
        }

        return qnas;
    }
    async getQnAsByShopId(
        shopSlug: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: QnA[], total: number, page: number, limit: number }> {
        const cacheKey = `qnas-shop-${shopSlug}-page-${page}-limit-${limit}`;
        let cachedResult = await this.cacheManager.get<{ data: QnA[], total: number }>(cacheKey);

        if (cachedResult) {
            return {
                ...cachedResult,
                page,
                limit
            };
        }

        const faqs = await this.getFAQsByShopSlug(shopSlug);
        const faqIds = faqs.data.map(faq => faq.id);

        const [data, total] = await this.qnaRepository.findAndCount({
            where: { faq: { id: In(faqIds) } },
            skip: (page - 1) * limit,
            take: limit,
        });

        const result = { data, total, page, limit };

        await this.cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour

        return result;
    }

}

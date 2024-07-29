import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FAQ } from './entities/faq.entity';
import { QnA, QnAType } from './entities/qna.entity';
import { Attachment } from 'src/common/entities/attachment.entity';

@Injectable()
export class FAQService {
    constructor(
        @InjectRepository(FAQ)
        private readonly faqRepository: Repository<FAQ>,
        @InjectRepository(QnA)
        private readonly qnaRepository: Repository<QnA>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
    ) { }

    async createFAQ(createFAQDto: any): Promise<FAQ> {
        const { title, description, shopId, imageIds, qnas } = createFAQDto;

        const faq = this.faqRepository.create({
            title,
            description,
            shop: { id: shopId },
            images: imageIds ? await this.attachmentRepository.findByIds(imageIds) : [],
            qnas: qnas ? await Promise.all(qnas.map(qna => this.qnaRepository.create(qna))) : [],
        });

        return this.faqRepository.save(faq);
    }

    async getFAQById(id: number): Promise<FAQ> {
        const faq = await this.faqRepository.findOne({
            where: { id },
            relations: ['shop', 'images', 'qnas'],
        });
        if (!faq) {
            throw new NotFoundException(`FAQ with ID ${id} not found`);
        }
        return faq;
    }

    async getFAQsByShopSlug(shopSlug: string): Promise<FAQ[]> {
        return this.faqRepository
            .createQueryBuilder('faq')
            .innerJoinAndSelect('faq.shop', 'shop', 'shop.slug = :slug', { slug: shopSlug })
            .leftJoinAndSelect('faq.images', 'images')
            .leftJoinAndSelect('faq.qnas', 'qnas')
            .getMany();
    }

    async updateFAQ(id: number, updateFAQDto: any): Promise<FAQ> {
        const faq = await this.getFAQById(id);

        if (updateFAQDto.title) faq.title = updateFAQDto.title;
        if (updateFAQDto.description) faq.description = updateFAQDto.description;
        if (updateFAQDto.shopId) faq.shop = updateFAQDto.shopId;
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

    async addQnAToFAQ(faqId: number, createQnADto: { question: string; answer: string; type?: QnAType; }): Promise<QnA> {
        const faq = await this.getFAQById(faqId);
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
        const faq = await this.getFAQById(faqId);
        return this.qnaRepository.find({ where: { faq: { id: faq.id } } });
    }

    async getQnAsByShopId(shopSlug: string): Promise<QnA[]> {
        const faqs = await this.getFAQsByShopSlug(shopSlug);
        const faqIds = faqs.map(faq => faq.id);
        return this.qnaRepository.find({ where: { faq: { id: In(faqIds) } } });
    }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const faq_entity_1 = require("./entities/faq.entity");
const qna_entity_1 = require("./entities/qna.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
let FAQService = class FAQService {
    constructor(faqRepository, qnaRepository, attachmentRepository, cacheManager) {
        this.faqRepository = faqRepository;
        this.qnaRepository = qnaRepository;
        this.attachmentRepository = attachmentRepository;
        this.cacheManager = cacheManager;
    }
    async createFAQ(createFAQDto) {
        const { title, description, shop_id, imageIds, qnas } = createFAQDto;
        console.log(title, description, shop_id, imageIds, qnas);
        const faq = this.faqRepository.create({
            title,
            description,
            shop: { id: shop_id },
            images: imageIds ? await this.attachmentRepository.findByIds(imageIds) : [],
            qnas: qnas ? await Promise.all(qnas.map(qna => this.qnaRepository.create(qna))) : [],
        });
        return this.faqRepository.save(faq);
    }
    async getFAQById(id) {
        const cacheKey = `faq-${id}`;
        let faq = await this.cacheManager.get(cacheKey);
        if (!faq) {
            faq = await this.faqRepository.findOne({
                where: { id },
                relations: ['shop', 'images', 'qnas'],
            });
            if (!faq) {
                throw new common_1.NotFoundException(`FAQ with ID ${id} not found`);
            }
            await this.cacheManager.set(cacheKey, faq, 60);
        }
        return faq;
    }
    async getFAQsByShopSlug(shopSlug, page = 1, limit = 10) {
        const cacheKey = `faqs-${shopSlug}-page-${page}-limit-${limit}`;
        let cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return Object.assign(Object.assign({}, cachedResult), { page,
                limit });
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
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
    async updateFAQ(id, updateFAQDto) {
        const faq = await this.getFAQById(id);
        if (updateFAQDto.title)
            faq.title = updateFAQDto.title;
        if (updateFAQDto.description)
            faq.description = updateFAQDto.description;
        if (updateFAQDto.shopId)
            faq.shop = updateFAQDto.shop_id;
        if (updateFAQDto.imageIds)
            faq.images = await this.attachmentRepository.findByIds(updateFAQDto.imageIds);
        if (updateFAQDto.qnas)
            faq.qnas = await Promise.all(updateFAQDto.qnas.map(qna => this.qnaRepository.create(qna)));
        return this.faqRepository.save(faq);
    }
    async deleteFAQ(id) {
        const result = await this.faqRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`FAQ with ID ${id} not found`);
        }
    }
    async addQnAToFAQ(faqId, createQnADto) {
        const faq = await this.getFAQById(faqId);
        if (!faq) {
            throw new common_1.NotFoundException(`FAQ with ID ${faqId} not found`);
        }
        const qna = this.qnaRepository.create(Object.assign(Object.assign({}, createQnADto), { faq }));
        return this.qnaRepository.save(qna);
    }
    async updateQnA(id, updateQnADto) {
        const qna = await this.qnaRepository.findOne({
            where: { id },
            relations: ['faq'],
        });
        if (!qna) {
            throw new common_1.NotFoundException(`QnA with ID ${id} not found`);
        }
        if (updateQnADto.question)
            qna.question = updateQnADto.question;
        if (updateQnADto.answer)
            qna.answer = updateQnADto.answer;
        if (updateQnADto.type)
            qna.type = updateQnADto.type;
        return this.qnaRepository.save(qna);
    }
    async deleteQnA(id) {
        const result = await this.qnaRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`QnA with ID ${id} not found`);
        }
    }
    async getQnAsByFAQId(faqId) {
        const cacheKey = `qnas-${faqId}`;
        let qnas = await this.cacheManager.get(cacheKey);
        if (!qnas) {
            const faq = await this.getFAQById(faqId);
            qnas = await this.qnaRepository.find({ where: { faq: { id: faq.id } } });
            await this.cacheManager.set(cacheKey, qnas, 60);
        }
        return qnas;
    }
    async getQnAsByShopId(shopSlug, page = 1, limit = 10) {
        const cacheKey = `qnas-shop-${shopSlug}-page-${page}-limit-${limit}`;
        let cachedResult = await this.cacheManager.get(cacheKey);
        if (cachedResult) {
            return Object.assign(Object.assign({}, cachedResult), { page,
                limit });
        }
        const faqs = await this.getFAQsByShopSlug(shopSlug);
        const faqIds = faqs.data.map(faq => faq.id);
        const [data, total] = await this.qnaRepository.findAndCount({
            where: { faq: { id: (0, typeorm_2.In)(faqIds) } },
            skip: (page - 1) * limit,
            take: limit,
        });
        const result = { data, total, page, limit };
        await this.cacheManager.set(cacheKey, result, 60);
        return result;
    }
};
FAQService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(faq_entity_1.FAQ)),
    __param(1, (0, typeorm_1.InjectRepository)(qna_entity_1.QnA)),
    __param(2, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(3, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], FAQService);
exports.FAQService = FAQService;
//# sourceMappingURL=faq.service.js.map
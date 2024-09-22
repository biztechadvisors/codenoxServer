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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const feedback_entity_1 = require("./entities/feedback.entity");
const typeorm_2 = require("typeorm");
const question_entity_1 = require("../questions/entities/question.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
let FeedbackService = class FeedbackService {
    constructor(feedbackRepository, questionRepository, shopRepository) {
        this.feedbackRepository = feedbackRepository;
        this.questionRepository = questionRepository;
        this.shopRepository = shopRepository;
    }
    async findAllFeedBacks(shopSlug, search) {
        const query = this.feedbackRepository.createQueryBuilder('feedback')
            .leftJoinAndSelect('feedback.user', 'user')
            .leftJoinAndSelect('feedback.shop', 'shop');
        if (shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: shopSlug } });
            if (shop) {
                query.andWhere('feedback.shop_id = :shopId', { shopId: shop.id });
            }
            else {
                throw new common_1.NotFoundException('Shop not found');
            }
        }
        if (search) {
            query.andWhere('feedback.model_type LIKE :search OR feedback.model_id LIKE :search', { search: `%${search}%` });
        }
        return await query.getMany();
    }
    async findFeedBack(id) {
        return await this.feedbackRepository.findOne({
            where: { id },
            relations: ['user']
        });
    }
    async create(createFeedBackDto) {
        const feedback = new feedback_entity_1.Feedback();
        feedback.model_id = createFeedBackDto.model_id;
        feedback.model_type = createFeedBackDto.model_type;
        feedback.negative = createFeedBackDto.negative;
        feedback.positive = createFeedBackDto.positive;
        feedback.user = createFeedBackDto.user;
        if (createFeedBackDto.shopSlug) {
            const shop = await this.shopRepository.findOne({ where: { slug: createFeedBackDto.shopSlug } });
            if (!shop) {
                throw new common_1.NotFoundException('Shop not found');
            }
            feedback.shop = shop;
        }
        if (feedback.positive || feedback.negative) {
            const question = await this.questionRepository.findOne({
                where: { id: createFeedBackDto.model_id },
            });
            if (question) {
                if (feedback.positive) {
                    question.positive_feedbacks_count += 1;
                }
                else if (feedback.negative) {
                    question.negative_feedbacks_count += 1;
                }
                await this.questionRepository.save(question);
            }
        }
        await this.feedbackRepository.save(feedback);
        return {
            message: 'Feedback created successfully',
            feedback,
        };
    }
    async update(id, updateFeedbackDto) {
        const existingFeedback = await this.feedbackRepository.findOne({ where: { id } });
        if (existingFeedback) {
            existingFeedback.model_id = updateFeedbackDto.model_id;
            existingFeedback.model_type = updateFeedbackDto.model_type;
            existingFeedback.negative = updateFeedbackDto.negative;
            existingFeedback.positive = updateFeedbackDto.positive;
            existingFeedback.user = updateFeedbackDto.user;
            if (updateFeedbackDto.shopSlug) {
                const shop = await this.shopRepository.findOne({ where: { slug: updateFeedbackDto.shopSlug } });
                if (!shop) {
                    throw new common_1.NotFoundException('Shop not found');
                }
                existingFeedback.shop = shop;
            }
            return await this.feedbackRepository.save(existingFeedback);
        }
        throw new common_1.NotFoundException('Feedback not found');
    }
    async delete(id) {
        const existingFeedback = await this.feedbackRepository.findOne({ where: { id } });
        if (!existingFeedback) {
            throw new common_1.NotFoundException('Feedback not found');
        }
        await this.feedbackRepository.remove(existingFeedback);
    }
};
FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feedback_entity_1.Feedback)),
    __param(1, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FeedbackService);
exports.FeedbackService = FeedbackService;
//# sourceMappingURL=feedbacks.service.js.map
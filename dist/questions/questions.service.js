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
exports.QuestionService = void 0;
const common_1 = require("@nestjs/common");
const paginate_1 = require("../common/pagination/paginate");
const question_entity_1 = require("./entities/question.entity");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_2 = require("typeorm");
const feedback_entity_1 = require("../feedbacks/entities/feedback.entity");
let QuestionService = class QuestionService {
    constructor(questionRepository, productRepository, userRepository, feedbackRepository) {
        this.questionRepository = questionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
    }
    async findAllQuestions({ limit = 10, page = 1, search, answer, product_id, }) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const findquestions = await this.questionRepository.find();
        for (const question of findquestions) {
            const feedbackCount = await this.feedbackRepository.find({
                where: { model_id: question.id, model_type: 'question' },
            });
            let positiveCount = 0;
            let negativeCount = 0;
            for (const feedback of feedbackCount) {
                const { positive, negative } = feedback;
                if (positive) {
                    positiveCount++;
                }
                else if (negative) {
                    negativeCount++;
                }
            }
            question.positive_feedbacks_count = positiveCount;
            question.negative_feedbacks_count = negativeCount;
            if (search) {
                const parseSearchParams = search.split(';');
                for (const searchParam of parseSearchParams) {
                    const [key, value] = searchParam.split(':');
                    if (!question[key].includes(value)) {
                        return null;
                    }
                }
            }
            if (product_id && question.product.id !== Number(product_id)) {
                return null;
            }
        }
        const results = findquestions.slice(startIndex, endIndex);
        const url = `/questions?search=${search}&answer=${answer}&limit=${limit}`;
        return Object.assign({ Alldata: results }, (0, paginate_1.paginate)(findquestions.length, page, limit, results.length, url));
    }
    async findQuestion(id) {
        const question = await this.questionRepository.findOne({
            where: { id: id }
        });
        let positiveCount = 0;
        let negativeCount = 0;
        if (question) {
            const feedbackCount = await this.feedbackRepository.find({
                where: { model_id: question.id, model_type: 'question' },
            });
            for (const data of feedbackCount) {
                const { positive, negative } = data;
                if (positive) {
                    positiveCount++;
                }
                else if (negative) {
                    negativeCount++;
                }
            }
            question.positive_feedbacks_count = positiveCount;
            question.negative_feedbacks_count = negativeCount;
        }
        return question;
    }
    async create(createQuestionDto) {
        const question = new question_entity_1.Question();
        question.question = createQuestionDto.question;
        question.answer = createQuestionDto.answer;
        question.negative_feedbacks_count = createQuestionDto.negative_feedbacks_count;
        question.positive_feedbacks_count = createQuestionDto.positive_feedbacks_count;
        question.shop_id = createQuestionDto.shop_id;
        if (createQuestionDto.product) {
            const Product = createQuestionDto.product;
            const existingProduct = await this.productRepository.find({
                where: { name: Product.name, product_type: Product.product_type }
            });
            if (existingProduct) {
                for (const data of existingProduct) {
                    question.product.id = data.id;
                }
            }
        }
        if (createQuestionDto.user) {
            const User = createQuestionDto.user;
            const existingUser = await this.userRepository.find({
                where: { name: User.name, email: User.email }, relations: ['type']
            });
            if (existingUser) {
                for (const data of existingUser) {
                    question.user.id = data.id;
                }
            }
        }
        return await this.questionRepository.save(question);
    }
    async update(id, updateQuestionDto) {
        try {
            const existingQuestion = await this.questionRepository.findOne({
                where: { id }
            });
            if (!existingQuestion) {
                throw new common_1.NotFoundException('Question not found');
            }
            existingQuestion.question = updateQuestionDto.question;
            existingQuestion.answer = updateQuestionDto.answer;
            existingQuestion.shop_id = updateQuestionDto.shop_id;
            if (updateQuestionDto.product) {
                const Product = updateQuestionDto.product;
                const existingProduct = await this.productRepository.find({
                    where: { name: Product.name, product_type: Product.product_type }
                });
                if (existingProduct) {
                    for (const data of existingProduct) {
                        existingQuestion.product.id = data.id;
                    }
                }
            }
            if (updateQuestionDto.user) {
                const User = updateQuestionDto.user;
                const existingUser = await this.userRepository.find({
                    where: { name: User.name, email: User.email }, relations: ['type']
                });
                if (existingUser) {
                    for (const data of existingUser) {
                        existingQuestion.user.id = data.id;
                    }
                }
                return await this.questionRepository.save(existingQuestion);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async delete(id) {
        const existingQuestion = await this.questionRepository.findOne({ where: { id } });
        if (!existingQuestion) {
            throw new common_1.NotFoundException('Question not found');
        }
        await this.questionRepository.remove(existingQuestion);
    }
};
QuestionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(feedback_entity_1.Feedback)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuestionService);
exports.QuestionService = QuestionService;
//# sourceMappingURL=questions.service.js.map
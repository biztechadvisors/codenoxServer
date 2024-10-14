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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const fuse_js_1 = __importDefault(require("fuse.js"));
const paginate_1 = require("../common/pagination/paginate");
const review_entity_1 = require("./entities/review.entity");
const product_entity_1 = require("../products/entities/product.entity");
const user_entity_1 = require("../users/entities/user.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const feedback_entity_1 = require("../feedbacks/entities/feedback.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const reports_entity_1 = require("./entities/reports.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const cacheService_1 = require("../helpers/cacheService");
let ReviewService = class ReviewService {
    constructor(reviewRepository, productRepository, userRepository, shopRepository, feedbackRepository, orderkRepository, reportRepository, cacheManager, cacheService) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.feedbackRepository = feedbackRepository;
        this.orderkRepository = orderkRepository;
        this.reportRepository = reportRepository;
        this.cacheManager = cacheManager;
        this.cacheService = cacheService;
    }
    async getReviewsFromDatabase() {
        return await this.reviewRepository.find();
    }
    async findReviewInDatabase(id) {
        const review = await this.reviewRepository.findOne({ where: { id: id } });
        if (!review) {
            throw new common_1.NotFoundException(`Review with ID ${id} not found`);
        }
        return review;
    }
    async createReviewInDatabase(createReviewDto) {
        const review = (0, class_transformer_1.plainToClass)(review_entity_1.Review, createReviewDto);
        if (review.product) {
            const getProduct = await this.productRepository.find({
                where: ({ name: review.product.name, slug: review.product.slug }),
            });
            if (getProduct.length > 0) {
                review.product = getProduct[0];
            }
        }
        if (review.user) {
            const getUser = await this.userRepository.find({
                where: ({ name: review.user.name, email: review.user.email }), relations: ['type']
            });
            if (getUser.length > 0) {
                review.user = getUser[0];
            }
        }
        if (review.shop) {
            const getShop = await this.shopRepository.find({
                where: ({ name: review.shop.name, slug: review.shop.slug }),
            });
            if (getShop.length > 0) {
                review.shop = getShop[0];
            }
        }
        if (review.my_feedback) {
            const getFeedback = await this.feedbackRepository.find({
                where: ({ id: review.my_feedback.id }),
            });
            if (getFeedback.length > 0) {
                review.my_feedback = getFeedback[0];
            }
        }
        if (review.order) {
            const getOrder = await this.orderkRepository.find({
                where: ({ id: review.order.id }),
            });
            if (getOrder.length > 0) {
                review.order = getOrder[0];
            }
        }
        if (review.abusive_reports) {
            const getReport = await this.reportRepository.find({
                where: {
                    user_id: review.abusive_reports[0].user_id,
                    id: review.abusive_reports[0].user_id,
                },
            });
            if (getReport.length > 0) {
                review.abusive_reports = getReport;
                review.abusive_reports_count = getReport.length;
            }
        }
        return;
    }
    async updateReviewInDatabase(id, updateReviewDto) {
        const review = await this.findReviewInDatabase(id);
        Object.assign(review, updateReviewDto);
        return await this.reviewRepository.save(review);
    }
    async deleteReviewInDatabase(id) {
        const review = await this.findReviewInDatabase(id);
        await this.reviewRepository.remove(review);
    }
    async findAllReviews({ limit = 10, page = 1, search, product_id, shopSlug, userId, }) {
        var _a;
        const cacheKey = `reviews_${shopSlug || 'all'}_${userId || 'all'}_${product_id || 'all'}_${search || 'all'}_${page}_${limit}`;
        let reviews = await this.cacheManager.get(cacheKey);
        if (!reviews) {
            reviews = await this.getReviewsFromDatabase();
            if (search) {
                const parseSearchParams = search.split(';');
                for (const searchParam of parseSearchParams) {
                    const [key, value] = searchParam.split(':');
                    const options = {
                        keys: [key],
                        threshold: 0.3,
                    };
                    const fuse = new fuse_js_1.default(reviews, options);
                    reviews = ((_a = fuse.search(value)) === null || _a === void 0 ? void 0 : _a.map(({ item }) => item)) || [];
                }
            }
            if (product_id) {
                reviews = reviews.filter((p) => p.product.id === Number(product_id));
            }
            if (shopSlug) {
                reviews = reviews.filter((review) => review.shop.slug === shopSlug);
            }
            if (userId) {
                reviews = reviews.filter((review) => review.user.id === userId);
            }
            await this.cacheManager.set(cacheKey, reviews, 60);
        }
        const startIndex = (page - 1) * limit;
        const results = reviews.slice(startIndex, startIndex + limit);
        const params = new URLSearchParams();
        if (search)
            params.append('search', search);
        if (limit)
            params.append('limit', limit.toString());
        if (page)
            params.append('page', page.toString());
        const url = `/reviews?${params.toString()}`;
        return Object.assign({ data: results }, (0, paginate_1.paginate)(reviews.length, page, limit, results.length, url));
    }
    async findReview(id) {
        return await this.findReviewInDatabase(id);
    }
    async create(createReviewDto) {
        return await this.createReviewInDatabase(createReviewDto);
    }
    async update(id, updateReviewDto) {
        return await this.updateReviewInDatabase(id, updateReviewDto);
    }
    async delete(id) {
        return await this.deleteReviewInDatabase(id);
    }
};
ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_2.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_2.InjectRepository)(shop_entity_1.Shop)),
    __param(4, (0, typeorm_2.InjectRepository)(feedback_entity_1.Feedback)),
    __param(5, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __param(6, (0, typeorm_2.InjectRepository)(reports_entity_1.Report)),
    __param(7, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository, Object, cacheService_1.CacheService])
], ReviewService);
exports.ReviewService = ReviewService;
//# sourceMappingURL=reviews.service.js.map
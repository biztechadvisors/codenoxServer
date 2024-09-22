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
exports.RefundsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const refund_entity_1 = require("./entities/refund.entity");
const analytics_service_1 = require("../analytics/analytics.service");
const shop_entity_1 = require("../shops/entities/shop.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
let RefundsService = class RefundsService {
    constructor(analyticsService, refundRepository, shopRepository, orderRepository, userRepository) {
        this.analyticsService = analyticsService;
        this.refundRepository = refundRepository;
        this.shopRepository = shopRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }
    async create(createRefundDto) {
        const { shopId, orderId, customerId } = createRefundDto;
        try {
            let shop = null;
            if (shopId) {
                shop = await this.shopRepository.findOne({ where: { id: shopId } });
                if (!shop) {
                    throw new common_1.NotFoundException(`Shop with ID ${shopId} not found.`);
                }
            }
            let order = null;
            if (orderId) {
                order = await this.orderRepository.findOne({ where: { id: orderId } });
                if (!order) {
                    throw new common_1.NotFoundException(`Order with ID ${orderId} not found.`);
                }
            }
            let customer = null;
            if (customerId) {
                customer = await this.userRepository.findOne({ where: { id: customerId } });
                if (!customer) {
                    throw new common_1.NotFoundException(`Customer with ID ${customerId} not found.`);
                }
            }
            const refund = this.refundRepository.create(Object.assign(Object.assign({}, createRefundDto), { shop,
                order,
                customer }));
            await this.refundRepository.save(refund);
            await this.analyticsService.updateAnalytics(undefined, refund);
            return refund;
        }
        catch (error) {
            console.error('Error creating refund:', error);
            throw new common_1.InternalServerErrorException('An error occurred while creating the refund.');
        }
    }
    async findAll() {
        return this.refundRepository.find({ relations: ['shop', 'order', 'customer'] });
    }
    async findOne(id) {
        const refund = await this.refundRepository.findOne({
            where: { id },
            relations: ['shop', 'order', 'customer'],
        });
        if (!refund) {
            throw new common_1.NotFoundException(`Refund with ID ${id} not found.`);
        }
        return refund;
    }
    async update(id, updateRefundDto) {
        const refund = await this.refundRepository.preload(Object.assign({ id }, updateRefundDto));
        if (!refund) {
            throw new common_1.NotFoundException(`Refund with ID ${id} not found.`);
        }
        return this.refundRepository.save(refund);
    }
    async remove(id) {
        const result = await this.refundRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Refund with ID ${id} not found.`);
        }
    }
};
RefundsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(refund_entity_1.Refund)),
    __param(2, (0, typeorm_1.InjectRepository)(shop_entity_1.Shop)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RefundsService);
exports.RefundsService = RefundsService;
//# sourceMappingURL=refunds.service.js.map
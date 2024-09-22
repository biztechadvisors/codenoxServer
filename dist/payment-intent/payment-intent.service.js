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
exports.PaymentIntentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_intent_entity_1 = require("./entries/payment-intent.entity");
let PaymentIntentService = class PaymentIntentService {
    constructor(paymentIntentRepository, paymentIntentInfoRepository) {
        this.paymentIntentRepository = paymentIntentRepository;
        this.paymentIntentInfoRepository = paymentIntentInfoRepository;
    }
    async getPaymentIntent(getPaymentIntentDto) {
        const { tracking_number, payment_gateway } = getPaymentIntentDto;
        const paymentIntent = await this.paymentIntentRepository.findOne({
            where: {
                tracking_number,
                payment_gateway,
            },
            relations: ['payment_intent_info'],
        });
        if (!paymentIntent) {
            throw new common_1.NotFoundException('Payment intent not found');
        }
        return paymentIntent;
    }
    async savePaymentIdIntent(razorpayData) {
        try {
            const paymentIntentInfo = await this.paymentIntentInfoRepository.findOne({ where: { order_id: razorpayData.razorpay_order_id } });
            if (paymentIntentInfo) {
                paymentIntentInfo.payment_id = razorpayData.razorpay_payment_id;
                return await this.paymentIntentInfoRepository.save(paymentIntentInfo);
            }
            else {
                throw new common_1.NotFoundException('PaymentIntentInfo not found');
            }
        }
        catch (error) {
            console.error(error);
            throw new common_1.InternalServerErrorException('Error saving payment ID intent');
        }
    }
};
PaymentIntentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_intent_entity_1.PaymentIntent)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_intent_entity_1.PaymentIntentInfo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentIntentService);
exports.PaymentIntentService = PaymentIntentService;
//# sourceMappingURL=payment-intent.service.js.map
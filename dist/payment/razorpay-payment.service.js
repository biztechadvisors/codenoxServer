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
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const razorpay_entity_1 = require("./entity/razorpay.entity");
const typeorm_2 = require("typeorm");
const Razorpay = require('razorpay');
let RazorpayService = class RazorpayService {
    constructor(paymentRepository, cardRepository) {
        this.paymentRepository = paymentRepository;
        this.cardRepository = cardRepository;
        this.key_secret = process.env.RAZORPAY_KEY_SECRET;
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: this.key_secret,
        });
    }
    async createPaymentIntent(order) {
        var _a, _b;
        try {
            const options = {
                amount: Math.floor(order.amount * 100),
                currency: 'INR',
                payment_capture: 1,
            };
            const razorpayOrder = await this.razorpay.orders.create(options);
            const redirect_url = ((_b = (_a = razorpayOrder.notes) === null || _a === void 0 ? void 0 : _a.redirect_url) === null || _b === void 0 ? void 0 : _b.toString()) || '';
            return {
                client_secret: this.key_secret,
                redirect_url,
                id: razorpayOrder.id,
            };
        }
        catch (err) {
            console.error(err);
            throw new common_1.HttpException(new Error(err.message), common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyOrder(razorpay_payment_id) {
        try {
            const payment = await this.razorpay.payments.fetch(razorpay_payment_id);
            await this.saveRazorPayRes(payment);
            return { payment };
        }
        catch (err) {
            throw new common_1.HttpException(err.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async saveRazorPayRes(payment) {
        try {
            const card = new razorpay_entity_1.Card();
            card.last4 = payment.card.last4;
            card.network = payment.card.network;
            card.razorPay_id = payment.card.id;
            card.type = payment.card.type;
            const cardEntity = this.cardRepository.create(card);
            await this.cardRepository.save(cardEntity);
            const paymentEntity = this.paymentRepository.create(Object.assign(Object.assign({}, payment), { card: cardEntity }));
            await this.paymentRepository.save(paymentEntity);
            return true;
        }
        catch (err) {
            throw new common_1.HttpException(err.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
RazorpayService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(razorpay_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(razorpay_entity_1.Card)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RazorpayService);
exports.RazorpayService = RazorpayService;
//# sourceMappingURL=razorpay-payment.service.js.map
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
exports.PaymentMethodService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const stripe_payment_service_1 = require("../payment/stripe-payment.service");
const payment_method_entity_1 = require("./entities/payment-method.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
let PaymentMethodService = class PaymentMethodService {
    constructor(authService, stripeService, paymentMethodRepository) {
        this.authService = authService;
        this.stripeService = stripeService;
        this.paymentMethodRepository = paymentMethodRepository;
    }
    async create(createPaymentMethodDto, user) {
        try {
            const paymentGateway = order_entity_1.PaymentGatewayType.STRIPE;
            return await this.saveCard(createPaymentMethodDto, paymentGateway, user);
        }
        catch (error) {
            console.log(error);
            throw new Error('Error creating payment method');
        }
    }
    async findAll(query) {
        const { text } = query;
        const whereClause = text ? { owner_name: (0, typeorm_1.ILike)(`%${text}%`) } : {};
        return this.paymentMethodRepository.find({
            where: whereClause,
        });
    }
    async findOne(id) {
        return this.paymentMethodRepository.findOne({ where: { id: id } });
    }
    async update(id, updatePaymentMethodDto) {
        const paymentMethod = await this.paymentMethodRepository.preload(Object.assign({ id: id }, updatePaymentMethodDto));
        if (!paymentMethod) {
            throw new Error('Payment method not found');
        }
        return this.paymentMethodRepository.save(paymentMethod);
    }
    async remove(id) {
        const paymentMethod = await this.findOne(id);
        if (!paymentMethod) {
            throw new Error('Payment method not found');
        }
        return this.paymentMethodRepository.remove(paymentMethod);
    }
    async saveDefaultCart(defaultCart) {
        let paymentMethod;
        paymentMethod = await this.paymentMethodRepository.findOne({
            where: { id: defaultCart.method_id },
        });
        if (paymentMethod) {
            paymentMethod.default_card = true;
            return this.paymentMethodRepository.save(paymentMethod);
        }
        else {
            throw new Error('Payment method not found.');
        }
    }
    async savePaymentMethod(createPaymentMethodDto, user) {
        const paymentGateway = order_entity_1.PaymentGatewayType.STRIPE;
        try {
            return this.saveCard(createPaymentMethodDto, paymentGateway, user);
        }
        catch (err) {
            console.log(err);
            throw new Error('Error saving payment method');
        }
    }
    async saveCard(createPaymentMethodDto, paymentGateway, user) {
        const { method_key, default_card } = createPaymentMethodDto;
        const retrievedPaymentMethod = await this.stripeService.retrievePaymentMethod(method_key);
        if (this.paymentMethodAlreadyExists(retrievedPaymentMethod.card.fingerprint)) {
            switch (paymentGateway) {
                case 'stripe':
                    break;
                case 'paypal':
                    break;
                default:
                    break;
            }
        }
        else {
            const paymentMethod = await this.makeNewPaymentMethodObject(createPaymentMethodDto, paymentGateway, user);
            return this.paymentMethodRepository.save(paymentMethod);
        }
    }
    paymentMethodAlreadyExists(fingerPrint) {
        return this.paymentMethodRepository.findOne({ where: { fingerprint: fingerPrint } }) !== null;
    }
    async makeNewPaymentMethodObject(createPaymentMethodDto, paymentGateway, user) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const { method_key, default_card } = createPaymentMethodDto;
        const { id: user_id, name, email } = await this.authService.me(user.email, user.id);
        let currentCustomer;
        try {
            const listofCustomer = await this.stripeService.listAllCustomers();
            currentCustomer = listofCustomer.find((customer) => customer.email === email);
            if (!currentCustomer) {
                currentCustomer = await this.stripeService.createCustomer({
                    name,
                    email,
                });
            }
            const attachedPaymentMethod = await this.stripeService.attachPaymentMethodToCustomer(method_key, currentCustomer.id);
            const paymentMethod = {
                id: Number(Date.now()),
                method_key,
                payment_gateway_id: 1,
                default_card,
                fingerprint: (_a = attachedPaymentMethod.card) === null || _a === void 0 ? void 0 : _a.fingerprint,
                owner_name: (_b = attachedPaymentMethod.billing_details) === null || _b === void 0 ? void 0 : _b.name,
                last4: (_c = attachedPaymentMethod.card) === null || _c === void 0 ? void 0 : _c.last4,
                expires: `${(_d = attachedPaymentMethod.card) === null || _d === void 0 ? void 0 : _d.exp_month}/${(_e = attachedPaymentMethod.card) === null || _e === void 0 ? void 0 : _e.exp_year}`,
                network: (_f = attachedPaymentMethod.card) === null || _f === void 0 ? void 0 : _f.brand,
                type: (_g = attachedPaymentMethod.card) === null || _g === void 0 ? void 0 : _g.funding,
                origin: (_h = attachedPaymentMethod.card) === null || _h === void 0 ? void 0 : _h.country,
                verification_check: (_k = (_j = attachedPaymentMethod.card) === null || _j === void 0 ? void 0 : _j.checks) === null || _k === void 0 ? void 0 : _k.cvc_check,
                created_at: new Date(),
                updated_at: new Date(),
            };
            return paymentMethod;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to process payment method: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
PaymentMethodService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(payment_method_entity_1.PaymentMethod)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        stripe_payment_service_1.StripePaymentService,
        typeorm_1.Repository])
], PaymentMethodService);
exports.PaymentMethodService = PaymentMethodService;
//# sourceMappingURL=payment-method.service.js.map
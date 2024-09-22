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
exports.StripePaymentService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_stripe_1 = require("nestjs-stripe");
const stripe_1 = __importDefault(require("stripe"));
let StripePaymentService = class StripePaymentService {
    constructor(stripeClient) {
        this.stripeClient = stripeClient;
    }
    async createCustomer(createCustomerDto) {
        try {
            const customer = await this.stripeClient.customers.create({
                description: createCustomerDto.description,
                name: createCustomerDto.name,
                email: createCustomerDto.email,
                address: createCustomerDto.address,
            });
            return customer;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create Stripe customer: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async retrieveCustomer(id) {
        try {
            const customer = await this.stripeClient.customers.retrieve(id);
            return customer;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to retrieve Stripe customer: ${error.message}`, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async listAllCustomers() {
        try {
            const customers = await this.stripeClient.customers.list();
            return customers.data;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to list Stripe customers: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createPaymentMethod(cardElementDto) {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.create({
                type: 'card',
                card: {
                    number: cardElementDto.number,
                    exp_month: cardElementDto.exp_month,
                    exp_year: cardElementDto.exp_year,
                    cvc: cardElementDto.cvc,
                },
            });
            return paymentMethod;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create payment method: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async retrievePaymentMethod(method_id) {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.retrieve(method_id);
            return paymentMethod;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to retrieve payment method: ${error.message}`, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async retrievePaymentMethodsByCustomer(customer_id) {
        try {
            const { data } = await this.stripeClient.customers.listPaymentMethods(customer_id, { type: 'card' });
            return data;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to retrieve payment methods by customer: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async attachPaymentMethodToCustomer(method_id, customer_id) {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.attach(method_id, { customer: String(customer_id) });
            return paymentMethod;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to attach payment method to customer: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async detachPaymentMethodFromCustomer(method_id) {
        try {
            const paymentMethod = await this.stripeClient.paymentMethods.detach(method_id);
            return paymentMethod;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to detach payment method from customer: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async createPaymentIntent(createPaymentIntentDto) {
        try {
            const paymentIntent = await this.stripeClient.paymentIntents.create({
                amount: createPaymentIntentDto.amount,
                currency: createPaymentIntentDto.currency,
                payment_method_types: ['card'],
            });
            return paymentIntent;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create payment intent: ${error.message}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async retrievePaymentIntent(payment_id) {
        try {
            const paymentIntent = await this.stripeClient.paymentIntents.retrieve(payment_id);
            return paymentIntent;
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to retrieve payment intent: ${error.message}`, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async createPaymentIntentParams(order, user) {
        try {
            const customerList = await this.listAllCustomers();
            let currentCustomer = customerList.find(customer => customer.email === user.email);
            if (!currentCustomer) {
                currentCustomer = await this.createCustomer({
                    name: user.name,
                    email: user.email,
                });
            }
            return {
                customer: currentCustomer.id,
                amount: Math.ceil(order.paid_total),
                currency: process.env.DEFAULT_CURRENCY || 'usd',
                payment_method_types: ['card'],
                metadata: {
                    order_tracking_number: order.tracking_number,
                },
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create payment intent parameters: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
StripePaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_stripe_1.InjectStripe)()),
    __metadata("design:paramtypes", [stripe_1.default])
], StripePaymentService);
exports.StripePaymentService = StripePaymentService;
//# sourceMappingURL=stripe-payment.service.js.map
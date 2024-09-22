"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaypalPaymentService = void 0;
const common_1 = require("@nestjs/common");
const Paypal = __importStar(require("@paypal/checkout-server-sdk"));
const uuid_1 = require("uuid");
let PaypalPaymentService = class PaypalPaymentService {
    constructor() {
        this.paypal = Paypal;
        this.clientId =
            process.env.PAYPAL_SANDBOX_CLIENT_ID;
        this.clientSecret =
            process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
        if (!this.clientId || !this.clientSecret) {
            throw new Error('PayPal client ID and secret must be provided.');
        }
        this.environment = process.env.NODE_ENV === 'production'
            ? new this.paypal.core.LiveEnvironment(this.clientId, this.clientSecret)
            : new this.paypal.core.SandboxEnvironment(this.clientId, this.clientSecret);
        this.client = new this.paypal.core.PayPalHttpClient(this.environment);
    }
    async createPaymentIntent(order) {
        var _a;
        const request = new this.paypal.orders.OrdersCreateRequest();
        request.headers['Content-Type'] = 'application/json';
        request.headers['PayPal-Request-Id'] = (0, uuid_1.v4)();
        const body = this.getRequestBody(order);
        request.requestBody(body);
        try {
            const response = await this.client.execute(request);
            const { links, id } = response.result;
            const redirect_url = ((_a = links === null || links === void 0 ? void 0 : links.find(link => link.rel === 'payer-action')) === null || _a === void 0 ? void 0 : _a.href) || '';
            return {
                client_secret: this.clientSecret,
                redirect_url,
                id,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: 'Error creating PayPal payment intent',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyOrder(orderId) {
        const request = new this.paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        try {
            const response = await this.client.execute(request);
            return {
                id: response.result.id,
                status: response.result.status,
            };
        }
        catch (error) {
            throw new common_1.HttpException({
                message: 'Error verifying PayPal order',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    getRequestBody(order) {
        var _a;
        const redirectUrl = process.env.SHOP_URL || 'http://localhost:3003';
        const reference_id = order.tracking_number || ((_a = order.id) === null || _a === void 0 ? void 0 : _a.toString()) || (0, uuid_1.v4)();
        return {
            intent: 'CAPTURE',
            payment_source: {
                paypal: {
                    experience_context: {
                        return_url: `${redirectUrl}/orders/${order.tracking_number}/thank-you`,
                        payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                        cancel_url: `${redirectUrl}/orders/${order.tracking_number}/payment`,
                        user_action: 'PAY_NOW',
                    },
                },
            },
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: order.total.toFixed(2),
                    },
                    description: 'Order from Marvel',
                    reference_id,
                },
            ],
        };
    }
};
PaypalPaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PaypalPaymentService);
exports.PaypalPaymentService = PaypalPaymentService;
//# sourceMappingURL=paypal-payment.service.js.map
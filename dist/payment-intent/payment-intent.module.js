"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentIntentModule = void 0;
const common_1 = require("@nestjs/common");
const payment_intent_controller_1 = require("./payment-intent.controller");
const payment_intent_service_1 = require("./payment-intent.service");
const typeorm_1 = require("@nestjs/typeorm");
const payment_intent_entity_1 = require("./entries/payment-intent.entity");
let PaymentIntentModule = class PaymentIntentModule {
};
PaymentIntentModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([payment_intent_entity_1.PaymentIntent, payment_intent_entity_1.PaymentIntentInfo])],
        controllers: [payment_intent_controller_1.PaymentIntentController],
        providers: [payment_intent_service_1.PaymentIntentService],
    })
], PaymentIntentModule);
exports.PaymentIntentModule = PaymentIntentModule;
//# sourceMappingURL=payment-intent.module.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripePaymentIntent = exports.PaymentIntentMetadata = exports.StripePaymentMethod = exports.StripeCustomer = exports.InvoiceSettings = exports.Card = exports.BillingDetails = exports.Metadata = exports.Address = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let Address = class Address {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, city: { required: true, type: () => String }, country: { required: true, type: () => String }, line1: { required: true, type: () => String }, line2: { required: true, type: () => String }, postal_code: { required: true, type: () => String }, state: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Address.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "line1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "line2", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "postal_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Address.prototype, "state", void 0);
Address = __decorate([
    (0, typeorm_1.Entity)()
], Address);
exports.Address = Address;
let Metadata = class Metadata {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, order_tracking_number: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Metadata.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Metadata.prototype, "order_tracking_number", void 0);
Metadata = __decorate([
    (0, typeorm_1.Entity)()
], Metadata);
exports.Metadata = Metadata;
let BillingDetails = class BillingDetails {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, address: { required: true, type: () => require("./stripe.entity").Address }, email: { required: true, type: () => String }, name: { required: true, type: () => String }, phone: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BillingDetails.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Address, { cascade: true, eager: true }),
    __metadata("design:type", Address)
], BillingDetails.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BillingDetails.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BillingDetails.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BillingDetails.prototype, "phone", void 0);
BillingDetails = __decorate([
    (0, typeorm_1.Entity)()
], BillingDetails);
exports.BillingDetails = BillingDetails;
let Card = class Card {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, brand: { required: true, type: () => String }, country: { required: true, type: () => String }, exp_month: { required: true, type: () => Number }, exp_year: { required: true, type: () => Number }, fingerprint: { required: true, type: () => String }, funding: { required: true, type: () => String }, last4: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Card.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Card.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Card.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Card.prototype, "exp_month", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Card.prototype, "exp_year", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Card.prototype, "fingerprint", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Card.prototype, "funding", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Card.prototype, "last4", void 0);
Card = __decorate([
    (0, typeorm_1.Entity)()
], Card);
exports.Card = Card;
let InvoiceSettings = class InvoiceSettings {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, custom_fields: { required: false, type: () => String }, default_payment_method: { required: false, type: () => String }, footer: { required: false, type: () => String }, rendering_options: { required: false, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InvoiceSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InvoiceSettings.prototype, "custom_fields", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InvoiceSettings.prototype, "default_payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InvoiceSettings.prototype, "footer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InvoiceSettings.prototype, "rendering_options", void 0);
InvoiceSettings = __decorate([
    (0, typeorm_1.Entity)()
], InvoiceSettings);
exports.InvoiceSettings = InvoiceSettings;
let StripeCustomer = class StripeCustomer {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, object: { required: true, type: () => String }, address: { required: true, type: () => require("./stripe.entity").Address }, balance: { required: false, type: () => Number }, created: { required: false, type: () => Number }, currency: { required: false, type: () => String }, default_source: { required: false, type: () => String }, delinquent: { required: false, type: () => Boolean }, description: { required: false, type: () => String }, discount: { required: false, type: () => String }, email: { required: false, type: () => String }, invoice_prefix: { required: false, type: () => String }, invoice_settings: { required: false, type: () => require("./stripe.entity").InvoiceSettings }, livemode: { required: false, type: () => Boolean }, metadata: { required: false, type: () => require("./stripe.entity").Metadata }, name: { required: false, type: () => String }, next_invoice_sequence: { required: false, type: () => Number }, phone: { required: false, type: () => String }, tax_exempt: { required: false, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StripeCustomer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StripeCustomer.prototype, "object", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Address, { cascade: true, eager: true }),
    __metadata("design:type", Address)
], StripeCustomer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StripeCustomer.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StripeCustomer.prototype, "created", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "default_source", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], StripeCustomer.prototype, "delinquent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "invoice_prefix", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => InvoiceSettings, { eager: true, cascade: true }),
    __metadata("design:type", InvoiceSettings)
], StripeCustomer.prototype, "invoice_settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], StripeCustomer.prototype, "livemode", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => Metadata, { eager: true, cascade: true }),
    __metadata("design:type", Metadata)
], StripeCustomer.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StripeCustomer.prototype, "next_invoice_sequence", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripeCustomer.prototype, "tax_exempt", void 0);
StripeCustomer = __decorate([
    (0, typeorm_1.Entity)()
], StripeCustomer);
exports.StripeCustomer = StripeCustomer;
let StripePaymentMethod = class StripePaymentMethod {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, object: { required: true, type: () => String }, billing_details: { required: true, type: () => require("./stripe.entity").BillingDetails }, card: { required: true, type: () => require("./stripe.entity").Card }, created: { required: true, type: () => Number }, customer: { required: true, type: () => String }, livemode: { required: true, type: () => Boolean }, metadata: { required: true, type: () => require("./stripe.entity").Metadata }, type: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StripePaymentMethod.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StripePaymentMethod.prototype, "object", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => BillingDetails, { cascade: true, eager: true }),
    __metadata("design:type", BillingDetails)
], StripePaymentMethod.prototype, "billing_details", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Card, { cascade: true, eager: true }),
    __metadata("design:type", Card)
], StripePaymentMethod.prototype, "card", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StripePaymentMethod.prototype, "created", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripePaymentMethod.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], StripePaymentMethod.prototype, "livemode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Metadata, { eager: true, cascade: true }),
    __metadata("design:type", Metadata)
], StripePaymentMethod.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripePaymentMethod.prototype, "type", void 0);
StripePaymentMethod = __decorate([
    (0, typeorm_1.Entity)()
], StripePaymentMethod);
exports.StripePaymentMethod = StripePaymentMethod;
let PaymentIntentMetadata = class PaymentIntentMetadata {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, order_tracking_number: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentIntentMetadata.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PaymentIntentMetadata.prototype, "order_tracking_number", void 0);
PaymentIntentMetadata = __decorate([
    (0, typeorm_1.Entity)()
], PaymentIntentMetadata);
exports.PaymentIntentMetadata = PaymentIntentMetadata;
let StripePaymentIntent = class StripePaymentIntent {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, amount: { required: true, type: () => Number }, amount_received: { required: true, type: () => Number }, client_secret: { required: true, type: () => String }, currency: { required: true, type: () => String }, customer: { required: true, type: () => String }, metadata: { required: true, type: () => require("./stripe.entity").PaymentIntentMetadata }, payment_method_types: { required: true, type: () => [String] }, setup_future_usage: { required: true, type: () => String }, status: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StripePaymentIntent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StripePaymentIntent.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StripePaymentIntent.prototype, "amount_received", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripePaymentIntent.prototype, "client_secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripePaymentIntent.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripePaymentIntent.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PaymentIntentMetadata, { eager: true, cascade: true }),
    __metadata("design:type", PaymentIntentMetadata)
], StripePaymentIntent.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], StripePaymentIntent.prototype, "payment_method_types", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripePaymentIntent.prototype, "setup_future_usage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StripePaymentIntent.prototype, "status", void 0);
StripePaymentIntent = __decorate([
    (0, typeorm_1.Entity)()
], StripePaymentIntent);
exports.StripePaymentIntent = StripePaymentIntent;
//# sourceMappingURL=stripe.entity.js.map
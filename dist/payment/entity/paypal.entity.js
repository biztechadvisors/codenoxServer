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
exports.Capture = exports.SellerReceivableBreakdown = exports.NetAmount = exports.PaypalFee = exports.GrossAmount = exports.SellerProtection = exports.Amount = exports.PurchaseUnit = exports.Payments = exports.Shipping = exports.Address2 = exports.Name2 = exports.PaypalCaptureOrderResponse = exports.Payer = exports.Link2 = exports.AccessToken = exports.Link = exports.PaypalOrderResponse = exports.PaymentSource = exports.Paypal = exports.Address = exports.Name = void 0;
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let Name = class Name {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, given_name: { required: true, type: () => String }, surname: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Name.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Name.prototype, "given_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Name.prototype, "surname", void 0);
Name = __decorate([
    (0, typeorm_1.Entity)()
], Name);
exports.Name = Name;
let Address = class Address {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, country_code: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Address.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address.prototype, "country_code", void 0);
Address = __decorate([
    (0, typeorm_1.Entity)()
], Address);
exports.Address = Address;
let Paypal = class Paypal {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, email_address: { required: true, type: () => String }, account_id: { required: true, type: () => String }, name: { required: true, type: () => require("./paypal.entity").Name }, address: { required: true, type: () => require("./paypal.entity").Address } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Paypal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Paypal.prototype, "email_address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Paypal.prototype, "account_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Name),
    __metadata("design:type", Name)
], Paypal.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Address),
    __metadata("design:type", Address)
], Paypal.prototype, "address", void 0);
Paypal = __decorate([
    (0, typeorm_1.Entity)()
], Paypal);
exports.Paypal = Paypal;
let PaymentSource = class PaymentSource {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, paypal: { required: true, type: () => require("./paypal.entity").Paypal } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentSource.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Paypal),
    __metadata("design:type", Paypal)
], PaymentSource.prototype, "paypal", void 0);
PaymentSource = __decorate([
    (0, typeorm_1.Entity)()
], PaymentSource);
exports.PaymentSource = PaymentSource;
let PaypalOrderResponse = class PaypalOrderResponse {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, status: { required: true, type: () => String }, payment_source: { required: true, type: () => require("./paypal.entity").PaymentSource }, links: { required: true, type: () => [require("./paypal.entity").Link] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], PaypalOrderResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaypalOrderResponse.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PaymentSource),
    __metadata("design:type", PaymentSource)
], PaypalOrderResponse.prototype, "payment_source", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Link),
    (0, typeorm_1.JoinTable)({ name: "paypalOrderResponse_links" }),
    __metadata("design:type", Array)
], PaypalOrderResponse.prototype, "links", void 0);
PaypalOrderResponse = __decorate([
    (0, typeorm_1.Entity)()
], PaypalOrderResponse);
exports.PaypalOrderResponse = PaypalOrderResponse;
let Link = class Link {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, href: { required: true, type: () => String }, rel: { required: true, type: () => String }, method: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Link.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Link.prototype, "href", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Link.prototype, "rel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Link.prototype, "method", void 0);
Link = __decorate([
    (0, typeorm_1.Entity)()
], Link);
exports.Link = Link;
let AccessToken = class AccessToken {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, scope: { required: true, type: () => String }, access_token: { required: true, type: () => String }, token_type: { required: true, type: () => String }, app_id: { required: true, type: () => String }, expires_in: { required: true, type: () => Number }, nonce: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AccessToken.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccessToken.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccessToken.prototype, "access_token", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccessToken.prototype, "token_type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccessToken.prototype, "app_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], AccessToken.prototype, "expires_in", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AccessToken.prototype, "nonce", void 0);
AccessToken = __decorate([
    (0, typeorm_1.Entity)()
], AccessToken);
exports.AccessToken = AccessToken;
let Link2 = class Link2 {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, href: { required: true, type: () => String }, rel: { required: true, type: () => String }, method: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Link2.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Link2.prototype, "href", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Link2.prototype, "rel", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Link2.prototype, "method", void 0);
Link2 = __decorate([
    (0, typeorm_1.Entity)()
], Link2);
exports.Link2 = Link2;
let Payer = class Payer {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => require("./paypal.entity").Name }, email_address: { required: true, type: () => String }, payer_id: { required: true, type: () => String }, address: { required: true, type: () => require("./paypal.entity").Address } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Payer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Name),
    __metadata("design:type", Name)
], Payer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payer.prototype, "email_address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payer.prototype, "payer_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Address),
    __metadata("design:type", Address)
], Payer.prototype, "address", void 0);
Payer = __decorate([
    (0, typeorm_1.Entity)()
], Payer);
exports.Payer = Payer;
let PaypalCaptureOrderResponse = class PaypalCaptureOrderResponse {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, status: { required: true, type: () => String }, payment_source: { required: true, type: () => require("./paypal.entity").PaymentSource }, purchase_units: { required: true, type: () => [require("./paypal.entity").PurchaseUnit] }, payer: { required: true, type: () => require("./paypal.entity").Payer }, links: { required: true, type: () => [require("./paypal.entity").Link2] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], PaypalCaptureOrderResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaypalCaptureOrderResponse.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PaymentSource),
    __metadata("design:type", PaymentSource)
], PaypalCaptureOrderResponse.prototype, "payment_source", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => PurchaseUnit),
    (0, typeorm_1.JoinTable)({ name: "paypalCaptureOrderResponse_purchaseUnit" }),
    __metadata("design:type", Array)
], PaypalCaptureOrderResponse.prototype, "purchase_units", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Payer),
    __metadata("design:type", Payer)
], PaypalCaptureOrderResponse.prototype, "payer", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Link2),
    (0, typeorm_1.JoinTable)({ name: "paypalCaptureOrderResponse_Link2" }),
    __metadata("design:type", Array)
], PaypalCaptureOrderResponse.prototype, "links", void 0);
PaypalCaptureOrderResponse = __decorate([
    (0, typeorm_1.Entity)()
], PaypalCaptureOrderResponse);
exports.PaypalCaptureOrderResponse = PaypalCaptureOrderResponse;
let Name2 = class Name2 {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, full_name: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Name2.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Name2.prototype, "full_name", void 0);
Name2 = __decorate([
    (0, typeorm_1.Entity)()
], Name2);
exports.Name2 = Name2;
let Address2 = class Address2 {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, address_line_1: { required: true, type: () => String }, admin_area_2: { required: true, type: () => String }, admin_area_1: { required: true, type: () => String }, postal_code: { required: true, type: () => String }, country_code: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Address2.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address2.prototype, "address_line_1", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address2.prototype, "admin_area_2", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address2.prototype, "admin_area_1", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address2.prototype, "postal_code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Address2.prototype, "country_code", void 0);
Address2 = __decorate([
    (0, typeorm_1.Entity)()
], Address2);
exports.Address2 = Address2;
let Shipping = class Shipping {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => require("./paypal.entity").Name2 }, address: { required: true, type: () => require("./paypal.entity").Address2 } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Shipping.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Name2),
    __metadata("design:type", Name2)
], Shipping.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Address2),
    __metadata("design:type", Address2)
], Shipping.prototype, "address", void 0);
Shipping = __decorate([
    (0, typeorm_1.Entity)()
], Shipping);
exports.Shipping = Shipping;
let Payments = class Payments {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, captures: { required: true, type: () => [require("./paypal.entity").Capture] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Payments.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Capture),
    (0, typeorm_1.JoinTable)({ name: "payments_capture" }),
    __metadata("design:type", Array)
], Payments.prototype, "captures", void 0);
Payments = __decorate([
    (0, typeorm_1.Entity)()
], Payments);
exports.Payments = Payments;
let PurchaseUnit = class PurchaseUnit {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, reference_id: { required: true, type: () => String }, shipping: { required: true, type: () => require("./paypal.entity").Shipping }, payments: { required: true, type: () => require("./paypal.entity").Payments } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PurchaseUnit.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PurchaseUnit.prototype, "reference_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Shipping),
    __metadata("design:type", Shipping)
], PurchaseUnit.prototype, "shipping", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Payments),
    __metadata("design:type", Payments)
], PurchaseUnit.prototype, "payments", void 0);
PurchaseUnit = __decorate([
    (0, typeorm_1.Entity)()
], PurchaseUnit);
exports.PurchaseUnit = PurchaseUnit;
let Amount = class Amount {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, currency_code: { required: true, type: () => String }, value: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Amount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Amount.prototype, "currency_code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Amount.prototype, "value", void 0);
Amount = __decorate([
    (0, typeorm_1.Entity)()
], Amount);
exports.Amount = Amount;
let SellerProtection = class SellerProtection {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, status: { required: true, type: () => String }, dispute_categories: { required: true, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SellerProtection.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SellerProtection.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "json" }),
    __metadata("design:type", Array)
], SellerProtection.prototype, "dispute_categories", void 0);
SellerProtection = __decorate([
    (0, typeorm_1.Entity)()
], SellerProtection);
exports.SellerProtection = SellerProtection;
let GrossAmount = class GrossAmount {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, currency_code: { required: true, type: () => String }, value: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GrossAmount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GrossAmount.prototype, "currency_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], GrossAmount.prototype, "value", void 0);
GrossAmount = __decorate([
    (0, typeorm_1.Entity)()
], GrossAmount);
exports.GrossAmount = GrossAmount;
let PaypalFee = class PaypalFee {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, currency_code: { required: true, type: () => String }, value: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaypalFee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaypalFee.prototype, "currency_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PaypalFee.prototype, "value", void 0);
PaypalFee = __decorate([
    (0, typeorm_1.Entity)()
], PaypalFee);
exports.PaypalFee = PaypalFee;
let NetAmount = class NetAmount {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, currency_code: { required: true, type: () => String }, value: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], NetAmount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NetAmount.prototype, "currency_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], NetAmount.prototype, "value", void 0);
NetAmount = __decorate([
    (0, typeorm_1.Entity)()
], NetAmount);
exports.NetAmount = NetAmount;
let SellerReceivableBreakdown = class SellerReceivableBreakdown {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, gross_amount: { required: true, type: () => require("./paypal.entity").GrossAmount }, paypal_fee: { required: true, type: () => require("./paypal.entity").PaypalFee }, net_amount: { required: true, type: () => require("./paypal.entity").NetAmount } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SellerReceivableBreakdown.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => GrossAmount, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", GrossAmount)
], SellerReceivableBreakdown.prototype, "gross_amount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PaypalFee, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", PaypalFee)
], SellerReceivableBreakdown.prototype, "paypal_fee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => NetAmount, { cascade: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", NetAmount)
], SellerReceivableBreakdown.prototype, "net_amount", void 0);
SellerReceivableBreakdown = __decorate([
    (0, typeorm_1.Entity)()
], SellerReceivableBreakdown);
exports.SellerReceivableBreakdown = SellerReceivableBreakdown;
let Capture = class Capture {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, status: { required: true, type: () => String }, amount: { required: true, type: () => require("./paypal.entity").Amount }, final_capture: { required: true, type: () => Boolean }, seller_protection: { required: true, type: () => require("./paypal.entity").SellerProtection }, seller_receivable_breakdown: { required: true, type: () => require("./paypal.entity").SellerReceivableBreakdown }, links: { required: true, type: () => [require("./paypal.entity").Link] }, create_time: { required: true, type: () => String }, update_time: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], Capture.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Capture.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Amount),
    __metadata("design:type", Amount)
], Capture.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Capture.prototype, "final_capture", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SellerProtection),
    __metadata("design:type", SellerProtection)
], Capture.prototype, "seller_protection", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SellerReceivableBreakdown),
    __metadata("design:type", SellerReceivableBreakdown)
], Capture.prototype, "seller_receivable_breakdown", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Link),
    (0, typeorm_1.JoinTable)({ name: "Capture_link" }),
    __metadata("design:type", Array)
], Capture.prototype, "links", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Capture.prototype, "create_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Capture.prototype, "update_time", void 0);
Capture = __decorate([
    (0, typeorm_1.Entity)()
], Capture);
exports.Capture = Capture;
//# sourceMappingURL=paypal.entity.js.map
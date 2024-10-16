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
exports.Setting = exports.SettingsOptions = exports.ContactDetails = exports.Location = exports.CurrencyOptions = exports.EmailEvent = exports.SmsEvent = exports.PaymentGateway = exports.ServerInfo = exports.EmailCustomer = exports.EmailVendor = exports.EmailAdmin = exports.SmsCustomer = exports.SmsVendor = exports.LogoSettings = exports.DeliveryTime = exports.ShopSocials = exports.FacebookSettings = exports.GoogleSettings = exports.SeoSettings = exports.SmsAdmin = void 0;
const openapi = require("@nestjs/swagger");
const attachment_entity_1 = require("../../common/entities/attachment.entity");
const core_entity_1 = require("../../common/entities/core.entity");
const shop_entity_1 = require("../../shops/entities/shop.entity");
const typeorm_1 = require("typeorm");
let SmsAdmin = class SmsAdmin {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, refundOrder: { required: true, type: () => Boolean }, paymentOrder: { required: true, type: () => Boolean }, statusChangeOrder: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SmsAdmin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsAdmin.prototype, "refundOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsAdmin.prototype, "paymentOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsAdmin.prototype, "statusChangeOrder", void 0);
SmsAdmin = __decorate([
    (0, typeorm_1.Entity)()
], SmsAdmin);
exports.SmsAdmin = SmsAdmin;
let SeoSettings = class SeoSettings {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, metaTitle: { required: false, type: () => String }, metaDescription: { required: false, type: () => String }, ogTitle: { required: false, type: () => String }, ogDescription: { required: false, type: () => String }, ogImage: { required: false, type: () => require("../../common/entities/attachment.entity").Attachment }, twitterHandle: { required: false, type: () => String }, twitterCardType: { required: false, type: () => String }, metaTags: { required: false, type: () => String }, canonicalUrl: { required: false, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SeoSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "metaTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "metaDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "ogTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "ogDescription", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => attachment_entity_1.Attachment, { cascade: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", attachment_entity_1.Attachment)
], SeoSettings.prototype, "ogImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "twitterHandle", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "twitterCardType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "metaTags", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SeoSettings.prototype, "canonicalUrl", void 0);
SeoSettings = __decorate([
    (0, typeorm_1.Entity)()
], SeoSettings);
exports.SeoSettings = SeoSettings;
let GoogleSettings = class GoogleSettings {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, isEnable: { required: true, type: () => Boolean }, tagManagerId: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GoogleSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], GoogleSettings.prototype, "isEnable", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GoogleSettings.prototype, "tagManagerId", void 0);
GoogleSettings = __decorate([
    (0, typeorm_1.Entity)()
], GoogleSettings);
exports.GoogleSettings = GoogleSettings;
let FacebookSettings = class FacebookSettings {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, isEnable: { required: true, type: () => Boolean }, appId: { required: true, type: () => String }, pageId: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FacebookSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], FacebookSettings.prototype, "isEnable", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FacebookSettings.prototype, "appId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FacebookSettings.prototype, "pageId", void 0);
FacebookSettings = __decorate([
    (0, typeorm_1.Entity)()
], FacebookSettings);
exports.FacebookSettings = FacebookSettings;
let ShopSocials = class ShopSocials {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, icon: { required: true, type: () => String }, url: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ShopSocials.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopSocials.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ShopSocials.prototype, "url", void 0);
ShopSocials = __decorate([
    (0, typeorm_1.Entity)()
], ShopSocials);
exports.ShopSocials = ShopSocials;
let DeliveryTime = class DeliveryTime {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, title: { required: true, type: () => String }, description: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DeliveryTime.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryTime.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DeliveryTime.prototype, "description", void 0);
DeliveryTime = __decorate([
    (0, typeorm_1.Entity)()
], DeliveryTime);
exports.DeliveryTime = DeliveryTime;
let LogoSettings = class LogoSettings {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, original: { required: true, type: () => String }, thumbnail: { required: true, type: () => String }, file_name: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", String)
], LogoSettings.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LogoSettings.prototype, "original", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LogoSettings.prototype, "thumbnail", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LogoSettings.prototype, "file_name", void 0);
LogoSettings = __decorate([
    (0, typeorm_1.Entity)()
], LogoSettings);
exports.LogoSettings = LogoSettings;
let SmsVendor = class SmsVendor {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, refundOrder: { required: true, type: () => Boolean }, paymentOrder: { required: true, type: () => Boolean }, statusChangeOrder: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SmsVendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsVendor.prototype, "refundOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsVendor.prototype, "paymentOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsVendor.prototype, "statusChangeOrder", void 0);
SmsVendor = __decorate([
    (0, typeorm_1.Entity)()
], SmsVendor);
exports.SmsVendor = SmsVendor;
let SmsCustomer = class SmsCustomer {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, refundOrder: { required: true, type: () => Boolean }, paymentOrder: { required: true, type: () => Boolean }, statusChangeOrder: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SmsCustomer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsCustomer.prototype, "refundOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsCustomer.prototype, "paymentOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SmsCustomer.prototype, "statusChangeOrder", void 0);
SmsCustomer = __decorate([
    (0, typeorm_1.Entity)()
], SmsCustomer);
exports.SmsCustomer = SmsCustomer;
let EmailAdmin = class EmailAdmin {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, refundOrder: { required: true, type: () => Boolean }, paymentOrder: { required: true, type: () => Boolean }, statusChangeOrder: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailAdmin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailAdmin.prototype, "refundOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailAdmin.prototype, "paymentOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailAdmin.prototype, "statusChangeOrder", void 0);
EmailAdmin = __decorate([
    (0, typeorm_1.Entity)()
], EmailAdmin);
exports.EmailAdmin = EmailAdmin;
let EmailVendor = class EmailVendor {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, refundOrder: { required: true, type: () => Boolean }, createReview: { required: true, type: () => Boolean }, paymentOrder: { required: true, type: () => Boolean }, createQuestion: { required: true, type: () => Boolean }, statusChangeOrder: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailVendor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailVendor.prototype, "refundOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailVendor.prototype, "createReview", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailVendor.prototype, "paymentOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailVendor.prototype, "createQuestion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailVendor.prototype, "statusChangeOrder", void 0);
EmailVendor = __decorate([
    (0, typeorm_1.Entity)()
], EmailVendor);
exports.EmailVendor = EmailVendor;
let EmailCustomer = class EmailCustomer {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, refundOrder: { required: true, type: () => Boolean }, paymentOrder: { required: true, type: () => Boolean }, answerQuestion: { required: true, type: () => Boolean }, statusChangeOrder: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailCustomer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailCustomer.prototype, "refundOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailCustomer.prototype, "paymentOrder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailCustomer.prototype, "answerQuestion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], EmailCustomer.prototype, "statusChangeOrder", void 0);
EmailCustomer = __decorate([
    (0, typeorm_1.Entity)()
], EmailCustomer);
exports.EmailCustomer = EmailCustomer;
let ServerInfo = class ServerInfo {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, memory_limit: { required: true, type: () => String }, post_max_size: { required: true, type: () => Number }, max_input_time: { required: true, type: () => String }, max_execution_time: { required: true, type: () => String }, upload_max_filesize: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServerInfo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServerInfo.prototype, "memory_limit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ServerInfo.prototype, "post_max_size", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServerInfo.prototype, "max_input_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServerInfo.prototype, "max_execution_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ServerInfo.prototype, "upload_max_filesize", void 0);
ServerInfo = __decorate([
    (0, typeorm_1.Entity)()
], ServerInfo);
exports.ServerInfo = ServerInfo;
let PaymentGateway = class PaymentGateway {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, name: { required: true, type: () => String }, title: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentGateway.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentGateway.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentGateway.prototype, "title", void 0);
PaymentGateway = __decorate([
    (0, typeorm_1.Entity)()
], PaymentGateway);
exports.PaymentGateway = PaymentGateway;
let SmsEvent = class SmsEvent {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, admin: { required: true, type: () => require("./setting.entity").SmsAdmin }, vendor: { required: true, type: () => require("./setting.entity").SmsVendor }, customer: { required: true, type: () => require("./setting.entity").SmsCustomer } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SmsEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SmsAdmin),
    __metadata("design:type", SmsAdmin)
], SmsEvent.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SmsVendor),
    __metadata("design:type", SmsVendor)
], SmsEvent.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SmsCustomer),
    __metadata("design:type", SmsCustomer)
], SmsEvent.prototype, "customer", void 0);
SmsEvent = __decorate([
    (0, typeorm_1.Entity)()
], SmsEvent);
exports.SmsEvent = SmsEvent;
let EmailEvent = class EmailEvent {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, admin: { required: true, type: () => require("./setting.entity").EmailAdmin }, vendor: { required: true, type: () => require("./setting.entity").EmailVendor }, customer: { required: true, type: () => require("./setting.entity").EmailCustomer } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EmailEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmailAdmin),
    __metadata("design:type", EmailAdmin)
], EmailEvent.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmailVendor),
    __metadata("design:type", EmailVendor)
], EmailEvent.prototype, "vendor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmailCustomer),
    __metadata("design:type", EmailCustomer)
], EmailEvent.prototype, "customer", void 0);
EmailEvent = __decorate([
    (0, typeorm_1.Entity)()
], EmailEvent);
exports.EmailEvent = EmailEvent;
let CurrencyOptions = class CurrencyOptions {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, formation: { required: true, type: () => String }, fractions: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CurrencyOptions.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CurrencyOptions.prototype, "formation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CurrencyOptions.prototype, "fractions", void 0);
CurrencyOptions = __decorate([
    (0, typeorm_1.Entity)()
], CurrencyOptions);
exports.CurrencyOptions = CurrencyOptions;
let Location = class Location {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, lat: { required: true, type: () => Number }, lng: { required: true, type: () => Number }, city: { required: false, type: () => String }, state: { required: true, type: () => String }, country: { required: true, type: () => String }, zip: { required: false, type: () => String }, formattedAddress: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Location.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Location.prototype, "lat", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Location.prototype, "lng", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Location.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Location.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Location.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Location.prototype, "zip", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Location.prototype, "formattedAddress", void 0);
Location = __decorate([
    (0, typeorm_1.Entity)()
], Location);
exports.Location = Location;
let ContactDetails = class ContactDetails {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, socials: { required: true, type: () => [require("./setting.entity").ShopSocials] }, contact: { required: true, type: () => String }, location: { required: true, type: () => require("./setting.entity").Location }, website: { required: true, type: () => String } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ContactDetails.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ShopSocials, { cascade: true }),
    (0, typeorm_1.JoinTable)({ name: "ContactDetails_shopSocils" }),
    __metadata("design:type", Array)
], ContactDetails.prototype, "socials", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContactDetails.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Location),
    __metadata("design:type", Location)
], ContactDetails.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContactDetails.prototype, "website", void 0);
ContactDetails = __decorate([
    (0, typeorm_1.Entity)()
], ContactDetails);
exports.ContactDetails = ContactDetails;
let SettingsOptions = class SettingsOptions extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, contactDetails: { required: true, type: () => require("./setting.entity").ContactDetails }, currency: { required: true, type: () => String }, currencyOptions: { required: true, type: () => require("./setting.entity").CurrencyOptions }, currencyToWalletRatio: { required: true, type: () => Number }, defaultAi: { required: true, type: () => String }, defaultPaymentGateway: { required: true, type: () => String }, deliveryTime: { required: true, type: () => [require("./setting.entity").DeliveryTime] }, emailEvent: { required: true, type: () => require("./setting.entity").EmailEvent }, freeShipping: { required: true, type: () => Boolean }, freeShippingAmount: { required: true, type: () => Number }, guestCheckout: { required: true, type: () => Boolean }, isProductReview: { required: true, type: () => Boolean }, logo: { required: true, type: () => require("./setting.entity").LogoSettings }, maximumQuestionLimit: { required: true, type: () => Number }, maxShopDistance: { required: true, type: () => Number }, minimumOrderAmount: { required: true, type: () => Number }, paymentGateway: { required: true, type: () => [require("./setting.entity").PaymentGateway] }, seo: { required: true, type: () => require("./setting.entity").SeoSettings }, server_info: { required: true, type: () => require("./setting.entity").ServerInfo }, shippingClass: { required: true, type: () => Number }, signupPoints: { required: true, type: () => Number }, siteSubtitle: { required: true, type: () => String }, siteTitle: { required: true, type: () => String }, smsEvent: { required: true, type: () => require("./setting.entity").SmsEvent }, StripeCardOnly: { required: true, type: () => Boolean }, taxClass: { required: true, type: () => Number }, useAi: { required: true, type: () => Boolean }, useCashOnDelivery: { required: true, type: () => Boolean }, useEnableGateway: { required: true, type: () => Boolean }, useGoogleMap: { required: true, type: () => Boolean }, useMustVerifyEmail: { required: true, type: () => Boolean }, useOtp: { required: true, type: () => Boolean } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ContactDetails, { cascade: true }),
    __metadata("design:type", ContactDetails)
], SettingsOptions.prototype, "contactDetails", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SettingsOptions.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CurrencyOptions, { cascade: true }),
    __metadata("design:type", CurrencyOptions)
], SettingsOptions.prototype, "currencyOptions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "currencyToWalletRatio", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SettingsOptions.prototype, "defaultAi", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SettingsOptions.prototype, "defaultPaymentGateway", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => DeliveryTime, { cascade: true }),
    (0, typeorm_1.JoinTable)({ name: "settingsOptions_deliveryTime" }),
    __metadata("design:type", Array)
], SettingsOptions.prototype, "deliveryTime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => EmailEvent),
    __metadata("design:type", EmailEvent)
], SettingsOptions.prototype, "emailEvent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "freeShipping", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "freeShippingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "guestCheckout", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "isProductReview", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => LogoSettings, { cascade: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", LogoSettings)
], SettingsOptions.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "maximumQuestionLimit", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "maxShopDistance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "minimumOrderAmount", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => PaymentGateway),
    (0, typeorm_1.JoinTable)({ name: "settingsOptions_paymentGateway" }),
    __metadata("design:type", Array)
], SettingsOptions.prototype, "paymentGateway", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SeoSettings),
    __metadata("design:type", SeoSettings)
], SettingsOptions.prototype, "seo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ServerInfo),
    __metadata("design:type", ServerInfo)
], SettingsOptions.prototype, "server_info", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "shippingClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "signupPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SettingsOptions.prototype, "siteSubtitle", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SettingsOptions.prototype, "siteTitle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SmsEvent),
    __metadata("design:type", SmsEvent)
], SettingsOptions.prototype, "smsEvent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "StripeCardOnly", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SettingsOptions.prototype, "taxClass", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "useAi", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "useCashOnDelivery", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "useEnableGateway", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "useGoogleMap", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "useMustVerifyEmail", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], SettingsOptions.prototype, "useOtp", void 0);
SettingsOptions = __decorate([
    (0, typeorm_1.Entity)()
], SettingsOptions);
exports.SettingsOptions = SettingsOptions;
let Setting = class Setting extends core_entity_1.CoreEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, shop: { required: true, type: () => require("../../shops/entities/shop.entity").Shop, nullable: true }, options: { required: true, type: () => require("./setting.entity").SettingsOptions }, language: { required: true, type: () => String }, translated_languages: { required: true, type: () => [String] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Setting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => shop_entity_1.Shop, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", shop_entity_1.Shop)
], Setting.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => SettingsOptions, { cascade: true, nullable: true }),
    __metadata("design:type", SettingsOptions)
], Setting.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Setting.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json' }),
    __metadata("design:type", Array)
], Setting.prototype, "translated_languages", void 0);
Setting = __decorate([
    (0, typeorm_1.Entity)()
], Setting);
exports.Setting = Setting;
//# sourceMappingURL=setting.entity.js.map
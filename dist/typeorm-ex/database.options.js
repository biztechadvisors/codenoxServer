"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseOptions = void 0;
const common_1 = require("@nestjs/common");
const type_entity_1 = require("../types/entities/type.entity");
const address_entity_1 = require("../address/entities/address.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const attachment_entity_1 = require("../common/entities/attachment.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const payment_intent_entity_1 = require("../payment-intent/entries/payment-intent.entity");
const product_entity_1 = require("../products/entities/product.entity");
const setting_entity_1 = require("../settings/entities/setting.entity");
const balance_entity_1 = require("../shops/entities/balance.entity");
const shop_entity_1 = require("../shops/entities/shop.entity");
const shopSettings_entity_1 = require("../shops/entities/shopSettings.entity");
const profile_entity_1 = require("../users/entities/profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
const tag_entity_1 = require("../tags/entities/tag.entity");
const review_entity_1 = require("../reviews/entities/review.entity");
const feedback_entity_1 = require("../feedbacks/entities/feedback.entity");
const reports_entity_1 = require("../reviews/entities/reports.entity");
const attribute_value_entity_1 = require("../attributes/entities/attribute-value.entity");
const attribute_entity_1 = require("../attributes/entities/attribute.entity");
const order_status_entity_1 = require("../orders/entities/order-status.entity");
const coupon_entity_1 = require("../coupons/entities/coupon.entity");
const conversation_entity_1 = require("../conversations/entities/conversation.entity");
const withdraw_entity_1 = require("../withdraws/entities/withdraw.entity");
const wishlist_entity_1 = require("../wishlists/entities/wishlist.entity");
const tax_entity_1 = require("../taxes/entities/tax.entity");
const analytics_entity_1 = require("../analytics/entities/analytics.entity");
const manufacturer_entity_1 = require("../manufacturers/entities/manufacturer.entity");
const shipping_entity_1 = require("../shippings/entities/shipping.entity");
const report_entity_1 = require("../reports/entities/report.entity");
const refund_entity_1 = require("../refunds/entities/refund.entity");
const question_entity_1 = require("../questions/entities/question.entity");
const payment_method_entity_1 = require("../payment-method/entities/payment-method.entity");
const payment_gateway_entity_1 = require("../payment-method/entities/payment-gateway.entity");
const message_entity_1 = require("../messages/entities/message.entity");
let DatabaseOptions = class DatabaseOptions {
    createTypeOrmOptions() {
        return {
            type: 'mysql',
            host: '103.191.208.50',
            port: 3306,
            username: 'pzqjchtu_remote',
            password: 'h!Ibz6eSn!-S',
            database: 'pzqjchtu_CodenoxxAdmin',
            synchronize: false,
            entities: [
                user_entity_1.User,
                shop_entity_1.Shop,
                attachment_entity_1.Attachment,
                address_entity_1.UserAdd,
                address_entity_1.Add,
                order_entity_1.Order,
                balance_entity_1.Balance,
                shop_entity_1.PaymentInfo,
                payment_intent_entity_1.PaymentIntent,
                payment_intent_entity_1.PaymentIntentInfo,
                shopSettings_entity_1.ShopSettings,
                setting_entity_1.ShopSocials,
                setting_entity_1.Location,
                product_entity_1.Product,
                category_entity_1.Category,
                type_entity_1.Type,
                tag_entity_1.Tag,
                product_entity_1.Variation,
                product_entity_1.OrderProductPivot,
                review_entity_1.Review,
                feedback_entity_1.Feedback,
                reports_entity_1.Report,
                product_entity_1.VariationOption,
                setting_entity_1.Setting,
                setting_entity_1.SettingsOptions,
                setting_entity_1.ContactDetails,
                setting_entity_1.CurrencyOptions,
                setting_entity_1.DeliveryTime,
                setting_entity_1.EmailEvent,
                setting_entity_1.EmailAdmin,
                setting_entity_1.EmailVendor,
                setting_entity_1.EmailCustomer,
                setting_entity_1.LogoSettings,
                setting_entity_1.PaymentGateway,
                setting_entity_1.SeoSettings,
                setting_entity_1.ServerInfo,
                setting_entity_1.SmsAdmin,
                setting_entity_1.SmsVendor,
                setting_entity_1.SmsCustomer,
                type_entity_1.Type,
                profile_entity_1.Social,
                type_entity_1.Banner,
                type_entity_1.TypeSettings,
                attribute_value_entity_1.AttributeValue,
                attribute_entity_1.Attribute,
                order_status_entity_1.OrderStatus,
                coupon_entity_1.Coupon,
                setting_entity_1.SmsEvent,
                profile_entity_1.Profile,
                conversation_entity_1.Conversation,
                conversation_entity_1.LatestMessage,
                withdraw_entity_1.Withdraw,
                wishlist_entity_1.Wishlist,
                tax_entity_1.Tax,
                analytics_entity_1.Analytics,
                analytics_entity_1.TotalYearSaleByMonth,
                manufacturer_entity_1.Manufacturer,
                shipping_entity_1.Shipping,
                report_entity_1.MyReports,
                refund_entity_1.Refund,
                question_entity_1.Question,
                payment_method_entity_1.PaymentMethod,
                payment_gateway_entity_1.PaymentGateWay,
                message_entity_1.Message,
            ],
        };
    }
};
DatabaseOptions = __decorate([
    (0, common_1.Injectable)()
], DatabaseOptions);
exports.DatabaseOptions = DatabaseOptions;
//# sourceMappingURL=database.options.js.map
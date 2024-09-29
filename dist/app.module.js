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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_stripe_1 = require("nestjs-stripe");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const platform_express_1 = require("@nestjs/platform-express");
const cache_manager_1 = require("@nestjs/cache-manager");
const redisStore = __importStar(require("cache-manager-redis-store"));
const users_module_1 = require("./users/users.module");
const mail_module_1 = require("./mail/mail.module");
const common_module_1 = require("./common/common.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const categories_module_1 = require("./categories/categories.module");
const analytics_module_1 = require("./analytics/analytics.module");
const attributes_module_1 = require("./attributes/attributes.module");
const shippings_module_1 = require("./shippings/shippings.module");
const taxes_module_1 = require("./taxes/taxes.module");
const tags_module_1 = require("./tags/tags.module");
const shops_module_1 = require("./shops/shops.module");
const types_module_1 = require("./types/types.module");
const withdraws_module_1 = require("./withdraws/withdraws.module");
const uploads_module_1 = require("./uploads/uploads.module");
const settings_module_1 = require("./settings/settings.module");
const coupons_module_1 = require("./coupons/coupons.module");
const imports_module_1 = require("./imports/imports.module");
const auth_module_1 = require("./auth/auth.module");
const refunds_module_1 = require("./refunds/refunds.module");
const authors_module_1 = require("./authors/authors.module");
const manufacturers_module_1 = require("./manufacturers/manufacturers.module");
const newsletters_module_1 = require("./newsletters/newsletters.module");
const reviews_module_1 = require("./reviews/reviews.module");
const questions_module_1 = require("./questions/questions.module");
const wishlists_module_1 = require("./wishlists/wishlists.module");
const reports_module_1 = require("./reports/reports.module");
const feedbacks_module_1 = require("./feedbacks/feedbacks.module");
const payment_method_module_1 = require("./payment-method/payment-method.module");
const payment_intent_module_1 = require("./payment-intent/payment-intent.module");
const web_hook_module_1 = require("./web-hook/web-hook.module");
const payment_module_1 = require("./payment/payment.module");
const store_notices_module_1 = require("./store-notices/store-notices.module");
const conversations_module_1 = require("./conversations/conversations.module");
const messages_module_1 = require("./messages/messages.module");
const ai_module_1 = require("./ai/ai.module");
const permission_module_1 = require("./permission/permission.module");
const carts_module_1 = require("./carts/carts.module");
const stocks_module_1 = require("./stocks/stocks.module");
const notifications_module_1 = require("./notifications/notifications.module");
const faq_module_1 = require("./faq/faq.module");
const blog_module_1 = require("./blog/blog.module");
const event_module_1 = require("./events/event.module");
const get_inspired_module_1 = require("./get-inspired/get-inspired.module");
const notifications_middleware_1 = require("./common/middleware/notifications.middleware");
const core_1 = require("@nestjs/core");
const career_module_1 = require("./career/career.module");
const contact_module_1 = require("./contact/contact.module");
const region_module_1 = require("./region/region.module");
const addresses_module_1 = require("./address/addresses.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(notifications_middleware_1.NotificationsMiddleware)
            .forRoutes({ path: 'notify/send', method: common_1.RequestMethod.POST });
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('DB_HOST'),
                    port: +configService.get('DB_PORT', 10),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    synchronize: true,
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    logging: ['error'],
                    extra: {
                        connectionLimit: 50,
                        waitForConnections: true,
                        queueLimit: 0,
                        connectTimeout: 10000,
                        acquireTimeout: 30000,
                    },
                    ssl: configService.get('DB_SSL') ? { rejectUnauthorized: false } : false,
                    autoLoadEntities: true,
                }),
                inject: [config_1.ConfigService],
            }),
            nestjs_stripe_1.StripeModule.forRoot({
                apiKey: process.env.STRIPE_API_KEY,
                apiVersion: '2022-11-15',
            }),
            platform_express_1.MulterModule.register({ dest: './uploads' }),
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    store: redisStore,
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                    auth_pass: configService.get('REDIS_PASSWORD'),
                    ttl: configService.get('CACHE_TTL') || 3000,
                    isGlobal: true,
                }),
                inject: [config_1.ConfigService],
            }),
            users_module_1.UsersModule,
            mail_module_1.MailModule,
            common_module_1.CommonModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            categories_module_1.CategoriesModule,
            analytics_module_1.AnalyticsModule,
            attributes_module_1.AttributesModule,
            shippings_module_1.ShippingsModule,
            taxes_module_1.TaxesModule,
            tags_module_1.TagsModule,
            shops_module_1.ShopsModule,
            types_module_1.TypesModule,
            withdraws_module_1.WithdrawsModule,
            uploads_module_1.UploadsModule,
            settings_module_1.SettingsModule,
            coupons_module_1.CouponsModule,
            addresses_module_1.AddModule,
            imports_module_1.ImportsModule,
            auth_module_1.AuthModule,
            refunds_module_1.RefundsModule,
            authors_module_1.AuthorsModule,
            manufacturers_module_1.ManufacturersModule,
            newsletters_module_1.NewslettersModule,
            reviews_module_1.ReviewModule,
            questions_module_1.QuestionModule,
            wishlists_module_1.WishlistsModule,
            reports_module_1.ReportsModule,
            feedbacks_module_1.FeedbackModule,
            payment_method_module_1.PaymentMethodModule,
            payment_intent_module_1.PaymentIntentModule,
            web_hook_module_1.WebHookModule,
            payment_module_1.PaymentModule,
            store_notices_module_1.StoreNoticesModule,
            conversations_module_1.ConversationsModule,
            messages_module_1.MessagesModule,
            ai_module_1.AiModule,
            permission_module_1.PermissionModule,
            carts_module_1.CartsModule,
            stocks_module_1.StocksModule,
            notifications_module_1.NotificationModule,
            faq_module_1.FAQModule,
            blog_module_1.BlogModule,
            event_module_1.EventModule,
            get_inspired_module_1.GetInspiredModule,
            career_module_1.CareerModule,
            contact_module_1.ContactModule,
            region_module_1.RegionModule,
        ],
        controllers: [],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: cache_manager_1.CacheInterceptor,
            },
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map
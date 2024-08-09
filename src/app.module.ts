import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { StripeModule } from 'nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import * as redistStore from 'cache-manager-redis-store';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { CommonModule } from './common/common.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AttributesModule } from './attributes/attributes.module';
import { ShippingsModule } from './shippings/shippings.module';
import { TaxesModule } from './taxes/taxes.module';
import { TagsModule } from './tags/tags.module';
import { ShopsModule } from './shops/shops.module';
import { TypesModule } from './types/types.module';
import { WithdrawsModule } from './withdraws/withdraws.module';
import { UploadsModule } from './uploads/uploads.module';
import { SettingsModule } from './settings/settings.module';
import { CouponsModule } from './coupons/coupons.module';
import { AddressesModule } from './addresses/addresses.module';
import { ImportsModule } from './imports/imports.module';
import { AuthModule } from './auth/auth.module';
import { RefundsModule } from './refunds/refunds.module';
import { AuthorsModule } from './authors/authors.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { ReviewModule } from './reviews/reviews.module';
import { QuestionModule } from './questions/questions.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { ReportsModule } from './reports/reports.module';
import { FeedbackModule } from './feedbacks/feedbacks.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { PaymentIntentModule } from './payment-intent/payment-intent.module';
import { WebHookModule } from './web-hook/web-hook.module';
import { PaymentModule } from './payment/payment.module';
import { StoreNoticesModule } from './store-notices/store-notices.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { AiModule } from './ai/ai.module';
import { PermissionModule } from './permission/permission.module';
import { CartsModule } from './carts/carts.module';
import { StocksModule } from './stocks/stocks.module';
import { NotificationModule } from './notifications/notifications.module';
import { FAQModule } from './faq/faq.module';
import { BlogModule } from './blog/blog.module';
import { EventModule } from './events/event.module';
import { GetInspiredModule } from './get-inspired/get-inspired.module';

import { ShiprocketServiceEnv } from './updateEnv';
import { NotificationsMiddleware } from './common/middleware/notifications.middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: configService.get('DB_SYNC'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: ['error'], // log only errors for production
        extra: {
          connectionLimit: 100, // set based on your server's capacity and expected load
          waitForConnections: true,
          queueLimit: 0,
          connectTimeout: 10000, // 10 seconds
          acquireTimeout: 30000, // 30 seconds
        },
        ssl: configService.get('DB_SSL') ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    StripeModule.forRoot({
      apiKey: process.env.STRIPE_API_KEY,
      apiVersion: '2022-11-15',
    }),
    MulterModule.register({ dest: './uploads' }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        max: 100,
        isGlobal: true,
        ttl: configService.get<number>('CACHE_TTL'),
        store: redistStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MailModule,
    CommonModule,
    ProductsModule,
    OrdersModule,
    CategoriesModule,
    AnalyticsModule,
    AttributesModule,
    ShippingsModule,
    TaxesModule,
    TagsModule,
    ShopsModule,
    TypesModule,
    WithdrawsModule,
    UploadsModule,
    SettingsModule,
    CouponsModule,
    AddressesModule,
    ImportsModule,
    AuthModule,
    RefundsModule,
    AuthorsModule,
    ManufacturersModule,
    NewslettersModule,
    ReviewModule,
    QuestionModule,
    WishlistsModule,
    ReportsModule,
    FeedbackModule,
    PaymentMethodModule,
    PaymentIntentModule,
    WebHookModule,
    PaymentModule,
    StoreNoticesModule,
    ConversationsModule,
    MessagesModule,
    AiModule,
    PermissionModule,
    CartsModule,
    StocksModule,
    NotificationModule,
    FAQModule,
    BlogModule,
    EventModule,
    GetInspiredModule,
  ],
  controllers: [],
  providers: [
    ShiprocketServiceEnv,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NotificationsMiddleware)
      .forRoutes({ path: 'notify/send', method: RequestMethod.POST }); // Apply to the correct route
  }
}

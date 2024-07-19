/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { StripeModule } from 'nestjs-stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';

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
import { ShiprocketServiceEnv } from './updateEnv';
import { NotificationsMiddleware } from './common/middleware/notifications.middleware';
import { NotificationsGateway } from './notifications/gateways/notifications.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        synchronize: configService.get<boolean>('DB_SYNC'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        logging: false,
        timeout: 30,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    StripeModule.forRoot({
      apiKey: process.env.STRIPE_API_KEY,
      apiVersion: '2022-11-15',
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
    NotificationsGateway,
    MulterModule.register({ dest: './uploads' }),
  ],
  controllers: [],
  providers: [ShiprocketServiceEnv],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NotificationsMiddleware)
      .forRoutes(
        { path: 'register', method: RequestMethod.ALL },
      );
  }
}
